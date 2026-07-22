"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceService = void 0;
const WorkspaceRepository_1 = require("../repositories/WorkspaceRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const apiResponse_1 = require("../utils/apiResponse");
const notificationService_1 = require("./notificationService");
const Folder_1 = require("../models/Folder");
const ROLE_RANK = { viewer: 1, editor: 2, admin: 3 };
class WorkspaceService {
    /** Returns the caller's role in a workspace, or null if they're not a member at all */
    async getRole(workspaceId, userId) {
        const workspace = await WorkspaceRepository_1.workspaceRepository.findById(workspaceId);
        if (!workspace)
            return null;
        const membership = workspace.members.find((m) => m.user.toString() === userId);
        return membership?.role || null;
    }
    async assertRole(workspaceId, userId, minRole) {
        const role = await this.getRole(workspaceId, userId);
        if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
            throw apiResponse_1.ApiError.forbidden(`You need at least "${minRole}" access to this workspace`);
        }
        return role;
    }
    async listForUser(userId) {
        return WorkspaceRepository_1.workspaceRepository.findForUser(userId);
    }
    async create(userId, input) {
        return WorkspaceRepository_1.workspaceRepository.create({
            name: input.name,
            owner: userId,
            color: input.color || '#4FD1C5',
            icon: input.icon || 'users',
            members: [{ user: userId, role: 'admin' }],
        });
    }
    async getById(workspaceId, userId) {
        const workspace = await WorkspaceRepository_1.workspaceRepository.findById(workspaceId);
        if (!workspace)
            throw apiResponse_1.ApiError.notFound('Workspace not found');
        const isMember = workspace.members.some((m) => m.user.toString() === userId);
        if (!isMember)
            throw apiResponse_1.ApiError.notFound('Workspace not found');
        return workspace;
    }
    async update(workspaceId, userId, input) {
        await this.assertRole(workspaceId, userId, 'admin');
        return WorkspaceRepository_1.workspaceRepository.updateById(workspaceId, input);
    }
    async inviteMember(workspaceId, userId, identifier, role) {
        await this.assertRole(workspaceId, userId, 'admin');
        const invitee = await UserRepository_1.userRepository.findByEmailOrUsername(identifier);
        if (!invitee)
            throw apiResponse_1.ApiError.notFound('No user found with that email or username');
        const workspace = await WorkspaceRepository_1.workspaceRepository.findById(workspaceId);
        if (!workspace)
            throw apiResponse_1.ApiError.notFound('Workspace not found');
        const alreadyMember = workspace.members.some((m) => m.user.toString() === invitee._id.toString());
        if (alreadyMember) {
            await WorkspaceRepository_1.workspaceRepository.updateById(workspaceId, {
                $set: { 'members.$[elem].role': role },
            });
        }
        else {
            await WorkspaceRepository_1.workspaceRepository.updateById(workspaceId, {
                $push: { members: { user: invitee._id, role } },
            });
        }
        await notificationService_1.notificationService.create(invitee._id.toString(), 'note_shared', `You were added to the workspace "${workspace.name}"`, undefined, userId);
        return WorkspaceRepository_1.workspaceRepository.findById(workspaceId);
    }
    async removeMember(workspaceId, userId, targetUserId) {
        const workspace = await WorkspaceRepository_1.workspaceRepository.findById(workspaceId);
        if (!workspace)
            throw apiResponse_1.ApiError.notFound('Workspace not found');
        // Admins can remove anyone; anyone can remove themselves (leave)
        if (targetUserId !== userId) {
            await this.assertRole(workspaceId, userId, 'admin');
        }
        if (workspace.owner.toString() === targetUserId) {
            throw apiResponse_1.ApiError.badRequest("The workspace owner can't be removed — delete the workspace instead");
        }
        return WorkspaceRepository_1.workspaceRepository.updateById(workspaceId, {
            $pull: { members: { user: targetUserId } },
        });
    }
    async remove(workspaceId, userId) {
        const workspace = await WorkspaceRepository_1.workspaceRepository.findById(workspaceId);
        if (!workspace)
            throw apiResponse_1.ApiError.notFound('Workspace not found');
        if (workspace.owner.toString() !== userId) {
            throw apiResponse_1.ApiError.forbidden('Only the workspace owner can delete it');
        }
        // Folders in this workspace would otherwise be orphaned — referencing a
        // workspace that no longer exists, invisible in both the deleted
        // workspace's view and the owner's personal folder list. Reset them back
        // to personal folders (owned by whoever originally created each one)
        // rather than silently losing access to them.
        await Folder_1.Folder.updateMany({ workspace: workspaceId }, { workspace: null });
        return WorkspaceRepository_1.workspaceRepository.deleteById(workspaceId);
    }
}
exports.workspaceService = new WorkspaceService();
//# sourceMappingURL=workspaceService.js.map