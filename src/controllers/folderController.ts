import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { folderService } from '../services/folderService';
import { AuthRequest } from '../middlewares/authenticate';

export const listFolders = asyncHandler(async (req: AuthRequest, res) => {
  const workspaceId = req.query.workspace as string | undefined;
  const folders = await folderService.list(req.userId!, workspaceId);
  return ApiResponse.success(res, folders, 'Folders fetched');
});

export const createFolder = asyncHandler(async (req: AuthRequest, res) => {
  const folder = await folderService.create(req.userId!, req.body);
  return ApiResponse.created(res, folder, 'Folder created');
});

export const updateFolder = asyncHandler(async (req: AuthRequest, res) => {
  const folder = await folderService.update(req.params.id, req.userId!, req.body);
  return ApiResponse.success(res, folder, 'Folder updated');
});

export const deleteFolder = asyncHandler(async (req: AuthRequest, res) => {
  await folderService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Folder deleted');
});
