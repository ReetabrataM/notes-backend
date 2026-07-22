"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.folderService = void 0;
const FolderRepository_1 = require("../repositories/FolderRepository");
const workspaceService_1 = require("./workspaceService");
const apiResponse_1 = require("../utils/apiResponse");
class FolderService {
    async assertAccess(folderId, userId, minRole = 'viewer') {
        const folder = await FolderRepository_1.folderRepository.findById(folderId);
        if (!folder)
            throw apiResponse_1.ApiError.notFound('Folder not found');
        if (folder.owner.toString() === userId)
            return folder;
        if (folder.workspace) {
            await workspaceService_1.workspaceService.assertRole(folder.workspace.toString(), userId, minRole);
            return folder;
        }
        throw apiResponse_1.ApiError.notFound('Folder not found');
    }
    async list(userId, workspaceId) {
        if (workspaceId) {
            // Being in the workspace at all (viewer+) is enough to see its folders
            await workspaceService_1.workspaceService.assertRole(workspaceId, userId, 'viewer');
            return FolderRepository_1.folderRepository.findByWorkspace(workspaceId);
        }
        return FolderRepository_1.folderRepository.findPersonal(userId);
    }
    async create(userId, input) {
        if (input.workspace) {
            // Creating a folder inside a workspace requires edit rights there, same as editing any workspace content
            await workspaceService_1.workspaceService.assertRole(input.workspace, userId, 'editor');
        }
        return FolderRepository_1.folderRepository.create({
            name: input.name,
            parent: input.parent || null,
            workspace: input.workspace || null,
            icon: input.icon,
            color: input.color,
            owner: userId,
        });
    }
    async update(folderId, userId, input) {
        await this.assertAccess(folderId, userId, 'editor');
        return FolderRepository_1.folderRepository.updateById(folderId, input);
    }
    async remove(folderId, userId) {
        await this.assertAccess(folderId, userId, 'admin');
        return FolderRepository_1.folderRepository.deleteById(folderId);
    }
}
exports.folderService = new FolderService();
//# sourceMappingURL=folderService.js.map