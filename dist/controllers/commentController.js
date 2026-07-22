"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.listComments = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const commentService_1 = require("../services/commentService");
exports.listComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const comments = await commentService_1.commentService.list(req.params.noteId, req.userId);
    return apiResponse_1.ApiResponse.success(res, comments, 'Comments fetched');
});
exports.createComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const comment = await commentService_1.commentService.create(req.params.noteId, req.userId, req.body.content);
    return apiResponse_1.ApiResponse.created(res, comment, 'Comment added');
});
exports.deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await commentService_1.commentService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Comment deleted');
});
//# sourceMappingURL=commentController.js.map