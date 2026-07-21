import crypto from 'crypto';
import { sharedLinkRepository } from '../repositories/SharedLinkRepository';
import { userRepository } from '../repositories/UserRepository';
import { noteRepository } from '../repositories/NoteRepository';
import { ApiError } from '../utils/apiResponse';
import { ShareAccess } from '../models/SharedLink';
import { notificationService } from './notificationService';
import { Folder } from '../models/Folder';
import { workspaceService } from './workspaceService';

class SharingService {
  private async assertOwner(noteId: string, ownerId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note || note.owner.toString() !== ownerId) throw ApiError.notFound('Note not found');
    return note;
  }

  async getOrCreateLink(noteId: string, ownerId: string) {
    await this.assertOwner(noteId, ownerId);
    let link = await sharedLinkRepository.findByNote(noteId);
    if (!link) {
      link = (await sharedLinkRepository.create({
        note: noteId as any,
        owner: ownerId as any,
        token: crypto.randomBytes(16).toString('hex'),
      } as any)) as any;
    }
    return link!;
  }

  async updatePublicAccess(noteId: string, ownerId: string, isPublic: boolean, publicAccess: ShareAccess) {
    const link = await this.getOrCreateLink(noteId, ownerId);
    return sharedLinkRepository.updateById(link._id.toString(), { isPublic, publicAccess } as any);
  }

  async inviteCollaborator(noteId: string, ownerId: string, identifier: string, access: ShareAccess) {
    const link = await this.getOrCreateLink(noteId, ownerId);
    const invitee = await userRepository.findByEmailOrUsername(identifier);
    if (!invitee) throw ApiError.notFound('No user found with that email or username');
    if (invitee._id.toString() === ownerId) throw ApiError.badRequest('You already own this note');

    const alreadyInvited = link.collaborators.some((c) => c.user.toString() === invitee._id.toString());
    if (alreadyInvited) {
      await sharedLinkRepository.updateById(link._id.toString(), {
        $set: { 'collaborators.$[elem].access': access },
      } as any);
    } else {
      await sharedLinkRepository.updateById(link._id.toString(), {
        $push: { collaborators: { user: invitee._id, access } },
      } as any);
    }

    const note = await noteRepository.findById(noteId);
    await notificationService.create(
      invitee._id.toString(),
      'note_shared',
      `A note was shared with you: "${note?.title || 'Untitled Note'}"`,
      noteId,
      ownerId
    );

    return sharedLinkRepository.findByNote(noteId);
  }

  async removeCollaborator(noteId: string, ownerId: string, userId: string) {
    const link = await this.getOrCreateLink(noteId, ownerId);
    return sharedLinkRepository.updateById(link._id.toString(), {
      $pull: { collaborators: { user: userId } },
    } as any);
  }

  async getSettings(noteId: string, ownerId: string) {
    await this.assertOwner(noteId, ownerId);
    return sharedLinkRepository.findByNote(noteId);
  }

  async getByPublicToken(token: string) {
    const link = await sharedLinkRepository.findByToken(token);
    if (!link || !link.isPublic) throw ApiError.notFound('This shared link is not available');
    return link;
  }

  /** Returns 'owner' | 'edit' | 'read' | null for a given user on a given note */
  async getAccessLevel(noteId: string, userId: string): Promise<'owner' | 'edit' | 'read' | null> {
    const note = await noteRepository.findById(noteId);
    if (!note) return null;
    if (note.owner.toString() === userId) return 'owner';

    // A note inherits access from its folder's workspace, if it's in one —
    // this is what makes "shared folders" work: being a workspace member
    // grants access to every note in that folder without sharing each one
    // individually via the per-note SharedLink mechanism below.
    if (note.folder) {
      const folder = await Folder.findById(note.folder);
      if (folder?.workspace) {
        const role = await workspaceService.getRole(folder.workspace.toString(), userId);
        if (role === 'admin' || role === 'editor') return 'edit';
        if (role === 'viewer') return 'read';
      }
    }

    const link = await sharedLinkRepository.findByNote(noteId);
    if (!link) return null;
    const collab = link.collaborators.find((c) => c.user._id?.toString() === userId || c.user.toString() === userId);
    return collab ? collab.access : null;
  }

  async listSharedWithMe(userId: string) {
    const links = await sharedLinkRepository.find({ 'collaborators.user': userId } as any);
    return Promise.all(
      links.map(async (link) => {
        const note = await noteRepository.findById(link.note.toString());
        const access = link.collaborators.find((c) => c.user.toString() === userId)?.access;
        return { note, access, linkId: link._id };
      })
    );
  }
}

export const sharingService = new SharingService();
