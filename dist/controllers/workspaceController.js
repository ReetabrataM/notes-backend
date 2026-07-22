"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkspace = exports.removeMember = exports.inviteMember = exports.updateWorkspace = exports.getWorkspace = exports.createWorkspace = exports.listWorkspaces = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const workspaceService_1 = require("../services/workspaceService");
exports.listWorkspaces = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workspaces = await workspaceService_1.workspaceService.listForUser(req.userId);
    return apiResponse_1.ApiResponse.success(res, workspaces, 'Workspaces fetched');
});
exports.createWorkspace = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workspace = await workspaceService_1.workspaceService.create(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, workspace, 'Workspace created');
});
exports.getWorkspace = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workspace = await workspaceService_1.workspaceService.getById(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, workspace, 'Workspace fetched');
});
exports.updateWorkspace = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workspace = await workspaceService_1.workspaceService.update(req.params.id, req.userId, req.body);
    return apiResponse_1.ApiResponse.success(res, workspace, 'Workspace updated');
});
exports.inviteMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { identifier, role } = req.body;
    const workspace = await workspaceService_1.workspaceService.inviteMember(req.params.id, req.userId, identifier, role);
    return apiResponse_1.ApiResponse.success(res, workspace, 'Member added');
});
exports.removeMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workspace = await workspaceService_1.workspaceService.removeMember(req.params.id, req.userId, req.params.userId);
    return apiResponse_1.ApiResponse.success(res, workspace, 'Member removed');
});
exports.deleteWorkspace = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await workspaceService_1.workspaceService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Workspace deleted');
});
//# sourceMappingURL=workspaceController.js.map