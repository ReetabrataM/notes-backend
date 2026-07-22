"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSharedWithMe = exports.getPublicNote = exports.removeCollaborator = exports.inviteCollaborator = exports.updatePublicAccess = exports.getShareSettings = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const sharingService_1 = require("../services/sharingService");
exports.getShareSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const link = await sharingService_1.sharingService.getOrCreateLink(req.params.noteId, req.userId);
    return apiResponse_1.ApiResponse.success(res, link, 'Share settings fetched');
});
exports.updatePublicAccess = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { isPublic, publicAccess } = req.body;
    const link = await sharingService_1.sharingService.updatePublicAccess(req.params.noteId, req.userId, isPublic, publicAccess);
    return apiResponse_1.ApiResponse.success(res, link, 'Sharing settings updated');
});
exports.inviteCollaborator = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { identifier, access } = req.body;
    const link = await sharingService_1.sharingService.inviteCollaborator(req.params.noteId, req.userId, identifier, access);
    return apiResponse_1.ApiResponse.success(res, link, 'Collaborator invited');
});
exports.removeCollaborator = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const link = await sharingService_1.sharingService.removeCollaborator(req.params.noteId, req.userId, req.params.userId);
    return apiResponse_1.ApiResponse.success(res, link, 'Collaborator removed');
});
exports.getPublicNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const link = await sharingService_1.sharingService.getByPublicToken(req.params.token);
    return apiResponse_1.ApiResponse.success(res, link, 'Shared note fetched');
});
exports.listSharedWithMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notes = await sharingService_1.sharingService.listSharedWithMe(req.userId);
    return apiResponse_1.ApiResponse.success(res, notes, 'Notes shared with you');
});
//# sourceMappingURL=sharingController.js.map