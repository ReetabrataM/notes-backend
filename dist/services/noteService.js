"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteService = void 0;
const NoteRepository_1 = require("../repositories/NoteRepository");
const TagRepository_1 = require("../repositories/TagRepository");
const Note_1 = require("../models/Note");
const apiResponse_1 = require("../utils/apiResponse");
const sharingService_1 = require("./sharingService");
const VersionHistoryRepository_1 = require("../repositories/VersionHistoryRepository");
const ActivityLogRepository_1 = require("../repositories/ActivityLogRepository");
const aiService_1 = require("./aiService");
const Attachment_1 = require("../models/Attachment");
const fileKind_1 = require("../utils/fileKind");
const FolderRepository_1 = require("../repositories/FolderRepository");
const workspaceService_1 = require("./workspaceService");
class NoteService {
    async assertOwnership(noteId, owner) {
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        if (!note || note.owner.toString() !== owner) {
            throw apiResponse_1.ApiError.notFound('Note not found');
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
    extractLinkedNoteIds(html) {
        if (!html)
            return [];
        const matches = html.matchAll(/data-note-id="([a-f0-9]{24})"/g);
        return Array.from(new Set(Array.from(matches, (m) => m[1])));
    }
    /**
     * Refreshes a note's embedding for semantic search / ReetAI in the background.
     * Deliberately not awaited by callers — a slow or failed embedding call should
     * never block or fail a note save. No-ops entirely if AI isn't configured.
     */
    refreshEmbedding(noteId, title, plainText) {
        aiService_1.aiService
            .embed(`${title}\n\n${plainText}`)
            .then((embedding) => {
            if (embedding) {
                return Note_1.Note.updateOne({ _id: noteId }, { embedding, embeddingUpdatedAt: new Date() });
            }
        })
            .catch(() => {
            /* embedding is a best-effort enhancement; swallow errors */
        });
    }
    /** Allows the owner or a collaborator with at least `minAccess` to proceed */
    async assertAccess(noteId, userId, minAccess = 'read') {
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        if (!note)
            throw apiResponse_1.ApiError.notFound('Note not found');
        const level = await sharingService_1.sharingService.getAccessLevel(noteId, userId);
        if (!level)
            throw apiResponse_1.ApiError.notFound('Note not found');
        if (minAccess === 'edit' && level === 'read') {
            throw apiResponse_1.ApiError.forbidden('You only have read access to this note');
        }
        return note;
    }
    async list(query) {
        const resolved = { ...query };
        // Nested tags are a naming convention ("DBMS/Indexing"), so filtering by a
        // parent tag needs to expand to every tag ID that shares that prefix first.
        if (query.tagPrefix) {
            const prefixIds = await TagRepository_1.tagRepository.findIdsByPrefix(query.owner, query.tagPrefix);
            resolved.tags = [...(resolved.tags || []), ...prefixIds];
        }
        // "Has attachments" / "attachment type" live on a different collection —
        // resolve which notes qualify first, then feed that into the main query as
        // an _id restriction rather than trying to join across collections in one query.
        if (query.hasAttachments || query.attachmentType) {
            const attachmentFilter = { owner: query.owner };
            if (query.attachmentType) {
                const pattern = (0, fileKind_1.kindToMimePattern)(query.attachmentType);
                if (pattern)
                    Object.assign(attachmentFilter, pattern);
            }
            const matchingNoteIds = await Attachment_1.Attachment.find(attachmentFilter).distinct('note');
            resolved.idsIn = matchingNoteIds.map((id) => id.toString());
        }
        // If browsing a specific folder that belongs to a workspace, membership
        // (not note ownership) is what should govern visibility — otherwise a
        // "shared folder" would only ever show the viewer's own notes in it,
        // which defeats the point of sharing a folder in the first place.
        if (query.folder) {
            const folder = await FolderRepository_1.folderRepository.findById(query.folder);
            if (folder?.workspace) {
                const role = await workspaceService_1.workspaceService.getRole(folder.workspace.toString(), query.owner);
                if (role)
                    resolved.scopeToOwner = false;
                // If they're not a member, fall through with the normal owner-scoped
                // query — it'll just correctly return nothing, same as any other
                // folder that isn't theirs.
            }
        }
        return NoteRepository_1.noteRepository.paginate(resolved);
    }
    async getById(noteId, userId) {
        return this.assertAccess(noteId, userId, 'read');
    }
    async create(owner, input) {
        let tagIds = [];
        if (input.tagNames?.length) {
            const tags = await TagRepository_1.tagRepository.findOrCreateMany(owner, input.tagNames);
            tagIds = tags.map((t) => t._id.toString());
        }
        const note = await NoteRepository_1.noteRepository.create({
            owner: owner,
            title: input.title || 'Untitled Note',
            content: input.content || '',
            plainText: input.plainText || '',
            folder: input.folder || null,
            tags: tagIds,
            links: this.extractLinkedNoteIds(input.content || ''),
            color: input.color || '#FFFFFF',
            priority: input.priority || 'none',
        });
        await ActivityLogRepository_1.activityLogRepository.log(owner, 'created a note', 'note', note._id.toString(), { title: note.title });
        this.refreshEmbedding(note._id.toString(), note.title, note.plainText);
        return note;
    }
    async update(noteId, userId, input) {
        const existing = await this.assertAccess(noteId, userId, 'edit');
        // Snapshot the pre-update state into version history (skip trivial/empty snapshots)
        if (existing.title || existing.content) {
            await VersionHistoryRepository_1.versionHistoryRepository.create({
                note: noteId,
                author: userId,
                title: existing.title,
                content: existing.content,
                plainText: existing.plainText,
            });
        }
        let tagIds;
        if (input.tagNames) {
            const tags = await TagRepository_1.tagRepository.findOrCreateMany(existing.owner.toString(), input.tagNames);
            tagIds = tags.map((t) => t._id.toString());
        }
        const update = { ...input };
        delete update.tagNames;
        if (tagIds)
            update.tags = tagIds;
        if (input.content !== undefined)
            update.links = this.extractLinkedNoteIds(input.content);
        const updated = await NoteRepository_1.noteRepository.updateById(noteId, update);
        if (updated && (input.plainText !== undefined || input.title !== undefined)) {
            this.refreshEmbedding(noteId, updated.title, updated.plainText);
        }
        return updated;
    }
    async softDelete(noteId, owner) {
        await this.assertOwnership(noteId, owner);
        return NoteRepository_1.noteRepository.updateById(noteId, { isDeleted: true, deletedAt: new Date() });
    }
    async restore(noteId, owner) {
        await this.assertOwnership(noteId, owner);
        return NoteRepository_1.noteRepository.updateById(noteId, { isDeleted: false, deletedAt: null });
    }
    async permanentDelete(noteId, owner) {
        await this.assertOwnership(noteId, owner);
        return NoteRepository_1.noteRepository.deleteById(noteId);
    }
    async togglePin(noteId, owner) {
        const note = await this.assertOwnership(noteId, owner);
        return NoteRepository_1.noteRepository.updateById(noteId, { isPinned: !note.isPinned });
    }
    async toggleArchive(noteId, owner) {
        const note = await this.assertOwnership(noteId, owner);
        return NoteRepository_1.noteRepository.updateById(noteId, { isArchived: !note.isArchived });
    }
    async toggleFavorite(noteId, owner) {
        const note = await this.assertOwnership(noteId, owner);
        return NoteRepository_1.noteRepository.updateById(noteId, { isFavorite: !note.isFavorite });
    }
    async duplicate(noteId, owner) {
        const note = await this.assertOwnership(noteId, owner);
        const copy = await Note_1.Note.create({
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
    async bulkSoftDelete(noteIds, owner) {
        return Note_1.Note.updateMany({ _id: { $in: noteIds }, owner }, { isDeleted: true, deletedAt: new Date() });
    }
    async bulkArchive(noteIds, owner, isArchived) {
        return Note_1.Note.updateMany({ _id: { $in: noteIds }, owner }, { isArchived });
    }
    async bulkAddTags(noteIds, owner, tagNames) {
        const tags = await TagRepository_1.tagRepository.findOrCreateMany(owner, tagNames);
        const tagIds = tags.map((t) => t._id);
        return Note_1.Note.updateMany({ _id: { $in: noteIds }, owner }, { $addToSet: { tags: { $each: tagIds } } });
    }
    /** Notes that link TO this one — i.e. this note's backlinks */
    async getBacklinks(noteId, userId) {
        await this.assertAccess(noteId, userId, 'read');
        return Note_1.Note.find({ owner: userId, isDeleted: false, links: noteId })
            .select('title updatedAt')
            .sort({ updatedAt: -1 })
            .limit(50);
    }
    /** Lightweight title search used by the editor's [[note link]] autocomplete — deliberately not semantic search, since this needs to be instant as you type */
    async searchByTitle(userId, query, excludeNoteId, limit = 8) {
        const filter = { owner: userId, isDeleted: false };
        if (query.trim())
            filter.title = { $regex: query.trim(), $options: 'i' };
        if (excludeNoteId)
            filter._id = { $ne: excludeNoteId };
        return Note_1.Note.find(filter).select('title updatedAt').sort({ updatedAt: -1 }).limit(limit);
    }
}
exports.noteService = new NoteService();
//# sourceMappingURL=noteService.js.map