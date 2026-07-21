import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { versionService } from '../services/versionService';
import { AuthRequest } from '../middlewares/authenticate';

export const listVersions = asyncHandler(async (req: AuthRequest, res) => {
  const versions = await versionService.list(req.params.noteId, req.userId!);
  return ApiResponse.success(res, versions, 'Version history fetched');
});

export const restoreVersion = asyncHandler(async (req: AuthRequest, res) => {
  const note = await versionService.restore(req.params.noteId, req.params.versionId, req.userId!);
  return ApiResponse.success(res, note, 'Version restored');
});
