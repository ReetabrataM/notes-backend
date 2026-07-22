"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolder = exports.updateFolder = exports.createFolder = exports.listFolders = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const folderService_1 = require("../services/folderService");
exports.listFolders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workspaceId = req.query.workspace;
    const folders = await folderService_1.folderService.list(req.userId, workspaceId);
    return apiResponse_1.ApiResponse.success(res, folders, 'Folders fetched');
});
exports.createFolder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const folder = await folderService_1.folderService.create(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, folder, 'Folder created');
});
exports.updateFolder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const folder = await folderService_1.folderService.update(req.params.id, req.userId, req.body);
    return apiResponse_1.ApiResponse.success(res, folder, 'Folder updated');
});
exports.deleteFolder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await folderService_1.folderService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Folder deleted');
});
//# sourceMappingURL=folderController.js.map