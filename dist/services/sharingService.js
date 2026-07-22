"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharingService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const SharedLinkRepository_1 = require("../repositories/SharedLinkRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const NoteRepository_1 = require("../repositories/NoteRepository");
const apiResponse_1 = require("../utils/apiResponse");
const notificationService_1 = require("./notificationService");
const Folder_1 = require("../models/Folder");
const workspaceService_1 = require("./workspaceService");
class SharingService {
    async assertOwner(noteId, ownerId) {
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        if (!note || note.owner.toString() !== ownerId)
            throw apiResponse_1.ApiError.notFound('Note not found');
        return note;
    }
    async getOrCreateLink(noteId, ownerId) {
        await this.assertOwner(noteId, ownerId);
        let link = await SharedLinkRepository_1.sharedLinkRepository.findByNote(noteId);
        if (!link) {
            link = (await SharedLinkRepository_1.sharedLinkRepository.create({
                note: noteId,
                owner: ownerId,
                token: crypto_1.default.randomBytes(16).toString('hex'),
            }));
        }
        return link;
    }
    async updatePublicAccess(noteId, ownerId, isPublic, publicAccess) {
        const link = await this.getOrCreateLink(noteId, ownerId);
        return SharedLinkRepository_1.sharedLinkRepository.updateById(link._id.toString(), { isPublic, publicAccess });
    }
    async inviteCollaborator(noteId, ownerId, identifier, access) {
        const link = await this.getOrCreateLink(noteId, ownerId);
        const invitee = await UserRepository_1.userRepository.findByEmailOrUsername(identifier);
        if (!invitee)
            throw apiResponse_1.ApiError.notFound('No user found with that email or username');
        if (invitee._id.toString() === ownerId)
            throw apiResponse_1.ApiError.badRequest('You already own this note');
        const alreadyInvited = link.collaborators.some((c) => c.user.toString() === invitee._id.toString());
        if (alreadyInvited) {
            await SharedLinkRepository_1.sharedLinkRepository.updateById(link._id.toString(), {
                $set: { 'collaborators.$[elem].access': access },
            });
        }
        else {
            await SharedLinkRepository_1.sharedLinkRepository.updateById(link._id.toString(), {
                $push: { collaborators: { user: invitee._id, access } },
            });
        }
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        await notificationService_1.notificationService.create(invitee._id.toString(), 'note_shared', `A note was shared with you: "${note?.title || 'Untitled Note'}"`, noteId, ownerId);
        return SharedLinkRepository_1.sharedLinkRepository.findByNote(noteId);
    }
    async removeCollaborator(noteId, ownerId, userId) {
        const link = await this.getOrCreateLink(noteId, ownerId);
        return SharedLinkRepository_1.sharedLinkRepository.updateById(link._id.toString(), {
            $pull: { collaborators: { user: userId } },
        });
    }
    async getSettings(noteId, ownerId) {
        await this.assertOwner(noteId, ownerId);
        return SharedLinkRepository_1.sharedLinkRepository.findByNote(noteId);
    }
    async getByPublicToken(token) {
        const link = await SharedLinkRepository_1.sharedLinkRepository.findByToken(token);
        if (!link || !link.isPublic)
            throw apiResponse_1.ApiError.notFound('This shared link is not available');
        return link;
    }
    /** Returns 'owner' | 'edit' | 'read' | null for a given user on a given note */
    async getAccessLevel(noteId, userId) {
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        if (!note)
            return null;
        if (note.owner.toString() === userId)
            return 'owner';
        // A note inherits access from its folder's workspace, if it's in one —
        // this is what makes "shared folders" work: being a workspace member
        // grants access to every note in that folder without sharing each one
        // individually via the per-note SharedLink mechanism below.
        if (note.folder) {
            const folder = await Folder_1.Folder.findById(note.folder);
            if (folder?.workspace) {
                const role = await workspaceService_1.workspaceService.getRole(folder.workspace.toString(), userId);
                if (role === 'admin' || role === 'editor')
                    return 'edit';
                if (role === 'viewer')
                    return 'read';
            }
        }
        const link = await SharedLinkRepository_1.sharedLinkRepository.findByNote(noteId);
        if (!link)
            return null;
        const collab = link.collaborators.find((c) => c.user._id?.toString() === userId || c.user.toString() === userId);
        return collab ? collab.access : null;
    }
    async listSharedWithMe(userId) {
        const links = await SharedLinkRepository_1.sharedLinkRepository.find({ 'collaborators.user': userId });
        return Promise.all(links.map(async (link) => {
            const note = await NoteRepository_1.noteRepository.findById(link.note.toString());
            const access = link.collaborators.find((c) => c.user.toString() === userId)?.access;
            return { note, access, linkId: link._id };
        }));
    }
}
exports.sharingService = new SharingService();
//# sourceMappingURL=sharingService.js.map