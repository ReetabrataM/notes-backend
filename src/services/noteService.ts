import { noteRepository, NoteQueryOptions } from '../repositories/NoteRepository';
import { tagRepository } from '../repositories/TagRepository';
import { Note } from '../models/Note';
import { ApiError } from '../utils/apiResponse';
import { sharingService } from './sharingService';
import { versionHistoryRepository } from '../repositories/VersionHistoryRepository';
import { activityLogRepository } from '../repositories/ActivityLogRepository';
import { aiService } from './aiService';
import { Attachment } from '../models/Attachment';
import { kindToMimePattern } from '../utils/fileKind';
import { folderRepository } from '../repositories/FolderRepository';
import { workspaceService } from './workspaceService';

export interface CreateNoteInput {
  title?: string;
  content?: string;
  plainText?: string;
  folder?: string | null;
  tagNames?: string[];
  color?: string;
  priority?: string;
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {}

class NoteService {
  private async assertOwnership(noteId: string, owner: string) {
    const note = await noteRepository.findById(noteId);
    if (!note || note.owner.toString() !== owner) {
      throw ApiError.notFound('Note not found');
    }
    return note;
  }

  /**
   * The editor's [[note link]] extension renders links as
   * <a data-note-link data-note-id="...">Title</a>. Rather than storing links
   * separately from content (which would drift out of sync as people edit),
   * we derive the `links` array straight from the saved HTML every time a note
   * is created or updated — the content itself is always the source of truth,
   * and this just indexes it for fast backlink queries.
   */
  private extractLinkedNoteIds(html: string): string[] {
    if (!html) return [];
    const matches = html.matchAll(/data-note-id="([a-f0-9]{24})"/g);
    return Array.from(new Set(Array.from(matches, (m) => m[1])));
  }

  /**
   * Refreshes a note's embedding for semantic search / ReetAI in the background.
   * Deliberately not awaited by callers — a slow or failed embedding call should
   * never block or fail a note save. No-ops entirely if AI isn't configured.
   */
  private refreshEmbedding(noteId: string, title: string, plainText: string) {
    aiService
      .embed(`${title}\n\n${plainText}`)
      .then((embedding) => {
        if (embedding) {
          return Note.updateOne({ _id: noteId }, { embedding, embeddingUpdatedAt: new Date() });
        }
      })
      .catch(() => {
        /* embedding is a best-effort enhancement; swallow errors */
      });
  }

  /** Allows the owner or a collaborator with at least `minAccess` to proceed */
  private async assertAccess(noteId: string, userId: string, minAccess: 'read' | 'edit' = 'read') {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');

    const level = await sharingService.getAccessLevel(noteId, userId);
    if (!level) throw ApiError.notFound('Note not found');
    if (minAccess === 'edit' && level === 'read') {
      throw ApiError.forbidden('You only have read access to this note');
    }
    return note;
  }

  async list(query: NoteQueryOptions & { tagPrefix?: string; hasAttachments?: boolean; attachmentType?: string }) {
    const resolved: NoteQueryOptions = { ...query };

    // Nested tags are a naming convention ("DBMS/Indexing"), so filtering by a
    // parent tag needs to expand to every tag ID that shares that prefix first.
    if (query.tagPrefix) {
      const prefixIds = await tagRepository.findIdsByPrefix(query.owner, query.tagPrefix);
      resolved.tags = [...(resolved.tags || []), ...prefixIds];
    }

    // "Has attachments" / "attachment type" live on a different collection —
    // resolve which notes qualify first, then feed that into the main query as
    // an _id restriction rather than trying to join across collections in one query.
    if (query.hasAttachments || query.attachmentType) {
      const attachmentFilter: Record<string, unknown> = { owner: query.owner };
      if (query.attachmentType) {
        const pattern = kindToMimePattern(query.attachmentType);
        if (pattern) Object.assign(attachmentFilter, pattern);
      }
      const matchingNoteIds = await Attachment.find(attachmentFilter).distinct('note');
      resolved.idsIn = matchingNoteIds.map((id: any) => id.toString());
    }

    // If browsing a specific folder that belongs to a workspace, membership
    // (not note ownership) is what should govern visibility — otherwise a
    // "shared folder" would only ever show the viewer's own notes in it,
    // which defeats the point of sharing a folder in the first place.
    if (query.folder) {
      const folder = await folderRepository.findById(query.folder);
      if (folder?.workspace) {
        const role = await workspaceService.getRole(folder.workspace.toString(), query.owner);
        if (role) resolved.scopeToOwner = false;
        // If they're not a member, fall through with the normal owner-scoped
        // query — it'll just correctly return nothing, same as any other
        // folder that isn't theirs.
      }
    }

    return noteRepository.paginate(resolved);
  }

  async getById(noteId: string, userId: string) {
    return this.assertAccess(noteId, userId, 'read');
  }

  async create(owner: string, input: CreateNoteInput) {
    let tagIds: string[] = [];
    if (input.tagNames?.length) {
      const tags = await tagRepository.findOrCreateMany(owner, input.tagNames);
      tagIds = tags.map((t) => t._id.toString());
    }

    const note = await noteRepository.create({
      owner: owner as any,
      title: input.title || 'Untitled Note',
      content: input.content || '',
      plainText: input.plainText || '',
      folder: (input.folder as any) || null,
      tags: tagIds as any,
      links: this.extractLinkedNoteIds(input.content || '') as any,
      color: input.color || '#FFFFFF',
      priority: (input.priority as any) || 'none',
    });

    await activityLogRepository.log(owner, 'created a note', 'note', note._id.toString(), { title: note.title });
    this.refreshEmbedding(note._id.toString(), note.title, note.plainText);
    return note;
  }

  async update(noteId: string, userId: string, input: UpdateNoteInput) {
    const existing = await this.assertAccess(noteId, userId, 'edit');

    // Snapshot the pre-update state into version history (skip trivial/empty snapshots)
    if (existing.title || existing.content) {
      await versionHistoryRepository.create({
        note: noteId as any,
        author: userId as any,
        title: existing.title,
        content: existing.content,
        plainText: existing.plainText,
      });
    }

    let tagIds: string[] | undefined;
    if (input.tagNames) {
      const tags = await tagRepository.findOrCreateMany(existing.owner.toString(), input.tagNames);
      tagIds = tags.map((t) => t._id.toString());
    }

    const update: any = { ...input };
    delete update.tagNames;
    if (tagIds) update.tags = tagIds;
    if (input.content !== undefined) update.links = this.extractLinkedNoteIds(input.content);

    const updated = await noteRepository.updateById(noteId, update);
    if (updated && (input.plainText !== undefined || input.title !== undefined)) {
      this.refreshEmbedding(noteId, updated.title, updated.plainText);
    }
    return updated;
  }

  async softDelete(noteId: string, owner: string) {
    await this.assertOwnership(noteId, owner);
    return noteRepository.updateById(noteId, { isDeleted: true, deletedAt: new Date() } as any);
  }

  async restore(noteId: string, owner: string) {
    await this.assertOwnership(noteId, owner);
    return noteRepository.updateById(noteId, { isDeleted: false, deletedAt: null } as any);
  }

  async permanentDelete(noteId: string, owner: string) {
    await this.assertOwnership(noteId, owner);
    return noteRepository.deleteById(noteId);
  }

  async togglePin(noteId: string, owner: string) {
    const note = await this.assertOwnership(noteId, owner);
    return noteRepository.updateById(noteId, { isPinned: !note.isPinned } as any);
  }

  async toggleArchive(noteId: string, owner: string) {
    const note = await this.assertOwnership(noteId, owner);
    return noteRepository.updateById(noteId, { isArchived: !note.isArchived } as any);
  }

  async toggleFavorite(noteId: string, owner: string) {
    const note = await this.assertOwnership(noteId, owner);
    return noteRepository.updateById(noteId, { isFavorite: !note.isFavorite } as any);
  }

  async duplicate(noteId: string, owner: string) {
    const note = await this.assertOwnership(noteId, owner);
    const copy = await Note.create({
      owner,
      title: `${note.title} (Copy)`,
      content: note.content,
      plainText: note.plainText,
      folder: note.folder,
      tags: note.tags,
      color: note.color,
      priority: note.priority,
    });
    return copy;
  }

  async bulkSoftDelete(noteIds: string[], owner: string) {
    return Note.updateMany(
      { _id: { $in: noteIds }, owner },
      { isDeleted: true, deletedAt: new Date() }
    );
  }

  async bulkArchive(noteIds: string[], owner: string, isArchived: boolean) {
    return Note.updateMany({ _id: { $in: noteIds }, owner }, { isArchived });
  }

  async bulkAddTags(noteIds: string[], owner: string, tagNames: string[]) {
    const tags = await tagRepository.findOrCreateMany(owner, tagNames);
    const tagIds = tags.map((t) => t._id);
    return Note.updateMany({ _id: { $in: noteIds }, owner }, { $addToSet: { tags: { $each: tagIds } } });
  }

  /** Notes that link TO this one — i.e. this note's backlinks */
  async getBacklinks(noteId: string, userId: string) {
    await this.assertAccess(noteId, userId, 'read');
    return Note.find({ owner: userId, isDeleted: false, links: noteId })
      .select('title updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);
  }

  /** Lightweight title search used by the editor's [[note link]] autocomplete — deliberately not semantic search, since this needs to be instant as you type */
  async searchByTitle(userId: string, query: string, excludeNoteId?: string, limit = 8) {
    const filter: any = { owner: userId, isDeleted: false };
    if (query.trim()) filter.title = { $regex: query.trim(), $options: 'i' };
    if (excludeNoteId) filter._id = { $ne: excludeNoteId };
    return Note.find(filter).select('title updatedAt').sort({ updatedAt: -1 }).limit(limit);
  }
}

export const noteService = new NoteService();
