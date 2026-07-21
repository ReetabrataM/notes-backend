import { folderRepository } from '../repositories/FolderRepository';
import { workspaceService } from './workspaceService';
import { ApiError } from '../utils/apiResponse';

export interface FolderInput {
  name: string;
  parent?: string | null;
  workspace?: string | null;
  icon?: string;
  color?: string;
}

class FolderService {
  private async assertAccess(folderId: string, userId: string, minRole: 'viewer' | 'editor' | 'admin' = 'viewer') {
    const folder = await folderRepository.findById(folderId);
    if (!folder) throw ApiError.notFound('Folder not found');

    if (folder.owner.toString() === userId) return folder;

    if (folder.workspace) {
      await workspaceService.assertRole(folder.workspace.toString(), userId, minRole);
      return folder;
    }

    throw ApiError.notFound('Folder not found');
  }

  async list(userId: string, workspaceId?: string) {
    if (workspaceId) {
      // Being in the workspace at all (viewer+) is enough to see its folders
      await workspaceService.assertRole(workspaceId, userId, 'viewer');
      return folderRepository.findByWorkspace(workspaceId);
    }
    return folderRepository.findPersonal(userId);
  }

  async create(userId: string, input: FolderInput) {
    if (input.workspace) {
      // Creating a folder inside a workspace requires edit rights there, same as editing any workspace content
      await workspaceService.assertRole(input.workspace, userId, 'editor');
    }
    return folderRepository.create({
      name: input.name,
      parent: (input.parent as any) || null,
      workspace: (input.workspace as any) || null,
      icon: input.icon,
      color: input.color,
      owner: userId as any,
    });
  }

  async update(folderId: string, userId: string, input: Partial<FolderInput>) {
    await this.assertAccess(folderId, userId, 'editor');
    return folderRepository.updateById(folderId, input as any);
  }

  async remove(folderId: string, userId: string) {
    await this.assertAccess(folderId, userId, 'admin');
    return folderRepository.deleteById(folderId);
  }
}

export const folderService = new FolderService();
