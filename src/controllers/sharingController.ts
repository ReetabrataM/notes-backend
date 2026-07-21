import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { sharingService } from '../services/sharingService';
import { AuthRequest } from '../middlewares/authenticate';

export const getShareSettings = asyncHandler(async (req: AuthRequest, res) => {
  const link = await sharingService.getOrCreateLink(req.params.noteId, req.userId!);
  return ApiResponse.success(res, link, 'Share settings fetched');
});

export const updatePublicAccess = asyncHandler(async (req: AuthRequest, res) => {
  const { isPublic, publicAccess } = req.body;
  const link = await sharingService.updatePublicAccess(req.params.noteId, req.userId!, isPublic, publicAccess);
  return ApiResponse.success(res, link, 'Sharing settings updated');
});

export const inviteCollaborator = asyncHandler(async (req: AuthRequest, res) => {
  const { identifier, access } = req.body;
  const link = await sharingService.inviteCollaborator(req.params.noteId, req.userId!, identifier, access);
  return ApiResponse.success(res, link, 'Collaborator invited');
});

export const removeCollaborator = asyncHandler(async (req: AuthRequest, res) => {
  const link = await sharingService.removeCollaborator(req.params.noteId, req.userId!, req.params.userId);
  return ApiResponse.success(res, link, 'Collaborator removed');
});

export const getPublicNote = asyncHandler(async (req, res) => {
  const link = await sharingService.getByPublicToken(req.params.token);
  return ApiResponse.success(res, link, 'Shared note fetched');
});

export const listSharedWithMe = asyncHandler(async (req: AuthRequest, res) => {
  const notes = await sharingService.listSharedWithMe(req.userId!);
  return ApiResponse.success(res, notes, 'Notes shared with you');
});
