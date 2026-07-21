import { workspaceRepository } from '../repositories/WorkspaceRepository';
import { userRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/apiResponse';
import { WorkspaceRole } from '../models/Workspace';
import { notificationService } from './notificationService';
import { Folder } from '../models/Folder';

const ROLE_RANK: Record<WorkspaceRole, number> = { viewer: 1, editor: 2, admin: 3 };

export interface WorkspaceInput {
  name: string;
  color?: string;
  icon?: string;
}

class WorkspaceService {
  /** Returns the caller's role in a workspace, or null if they're not a member at all */
  async getRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) return null;
    const membership = workspace.members.find((m) => m.user.toString() === userId);
    return membership?.role || null;
  }

  async assertRole(workspaceId: string, userId: string, minRole: WorkspaceRole) {
    const role = await this.getRole(workspaceId, userId);
    if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
      throw ApiError.forbidden(`You need at least "${minRole}" access to this workspace`);
    }
    return role;
  }

  async listForUser(userId: string) {
    return workspaceRepository.findForUser(userId);
  }

  async create(userId: string, input: WorkspaceInput) {
    return workspaceRepository.create({
      name: input.name,
      owner: userId as any,
      color: input.color || '#4FD1C5',
      icon: input.icon || 'users',
      members: [{ user: userId, role: 'admin' }],
    } as any);
  }

  async getById(workspaceId: string, userId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw ApiError.notFound('Workspace not found');
    const isMember = workspace.members.some((m) => m.user.toString() === userId);
    if (!isMember) throw ApiError.notFound('Workspace not found');
    return workspace;
  }

  async update(workspaceId: string, userId: string, input: Partial<WorkspaceInput>) {
    await this.assertRole(workspaceId, userId, 'admin');
    return workspaceRepository.updateById(workspaceId, input as any);
  }

  async inviteMember(workspaceId: string, userId: string, identifier: string, role: WorkspaceRole) {
    await this.assertRole(workspaceId, userId, 'admin');

    const invitee = await userRepository.findByEmailOrUsername(identifier);
    if (!invitee) throw ApiError.notFound('No user found with that email or username');

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw ApiError.notFound('Workspace not found');

    const alreadyMember = workspace.members.some((m) => m.user.toString() === invitee._id.toString());
    if (alreadyMember) {
      await workspaceRepository.updateById(workspaceId, {
        $set: { 'members.$[elem].role': role },
      } as any);
    } else {
      await workspaceRepository.updateById(workspaceId, {
        $push: { members: { user: invitee._id, role } },
      } as any);
    }

    await notificationService.create(
      invitee._id.toString(),
      'note_shared',
      `You were added to the workspace "${workspace.name}"`,
      undefined,
      userId
    );

    return workspaceRepository.findById(workspaceId);
  }

  async removeMember(workspaceId: string, userId: string, targetUserId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw ApiError.notFound('Workspace not found');

    // Admins can remove anyone; anyone can remove themselves (leave)
    if (targetUserId !== userId) {
      await this.assertRole(workspaceId, userId, 'admin');
    }
    if (workspace.owner.toString() === targetUserId) {
      throw ApiError.badRequest("The workspace owner can't be removed — delete the workspace instead");
    }

    return workspaceRepository.updateById(workspaceId, {
      $pull: { members: { user: targetUserId } },
    } as any);
  }

  async remove(workspaceId: string, userId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw ApiError.notFound('Workspace not found');
    if (workspace.owner.toString() !== userId) {
      throw ApiError.forbidden('Only the workspace owner can delete it');
    }

    // Folders in this workspace would otherwise be orphaned — referencing a
    // workspace that no longer exists, invisible in both the deleted
    // workspace's view and the owner's personal folder list. Reset them back
    // to personal folders (owned by whoever originally created each one)
    // rather than silently losing access to them.
    await Folder.updateMany({ workspace: workspaceId }, { workspace: null });

    return workspaceRepository.deleteById(workspaceId);
  }
}

export const workspaceService = new WorkspaceService();
