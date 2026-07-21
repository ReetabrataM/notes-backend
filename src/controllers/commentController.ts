import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { commentService } from '../services/commentService';
import { AuthRequest } from '../middlewares/authenticate';

export const listComments = asyncHandler(async (req: AuthRequest, res) => {
  const comments = await commentService.list(req.params.noteId, req.userId!);
  return ApiResponse.success(res, comments, 'Comments fetched');
});

export const createComment = asyncHandler(async (req: AuthRequest, res) => {
  const comment = await commentService.create(req.params.noteId, req.userId!, req.body.content);
  return ApiResponse.created(res, comment, 'Comment added');
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res) => {
  await commentService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Comment deleted');
});
