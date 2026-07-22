"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.reorderAttachments = exports.renameAttachment = exports.uploadAttachmentsBulk = exports.uploadAttachment = exports.listAttachments = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const attachmentService_1 = require("../services/attachmentService");
exports.listAttachments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const attachments = await attachmentService_1.attachmentService.list(req.params.noteId, req.userId);
    return apiResponse_1.ApiResponse.success(res, attachments, 'Attachments fetched');
});
exports.uploadAttachment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw apiResponse_1.ApiError.badRequest('No file uploaded');
    const attachment = await attachmentService_1.attachmentService.upload(req.params.noteId, req.userId, req.file);
    return apiResponse_1.ApiResponse.created(res, attachment, 'File uploaded');
});
exports.uploadAttachmentsBulk = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = req.files;
    if (!files?.length)
        throw apiResponse_1.ApiError.badRequest('No files uploaded');
    const attachments = await attachmentService_1.attachmentService.uploadMany(req.params.noteId, req.userId, files);
    return apiResponse_1.ApiResponse.created(res, attachments, 'Files uploaded');
});
exports.renameAttachment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const attachment = await attachmentService_1.attachmentService.rename(req.params.id, req.userId, req.body.originalName);
    return apiResponse_1.ApiResponse.success(res, attachment, 'File renamed');
});
exports.reorderAttachments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const attachments = await attachmentService_1.attachmentService.reorder(req.params.noteId, req.userId, req.body.orderedIds);
    return apiResponse_1.ApiResponse.success(res, attachments, 'Attachments reordered');
});
exports.deleteAttachment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await attachmentService_1.attachmentService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Attachment deleted');
});
//# sourceMappingURL=attachmentController.js.map