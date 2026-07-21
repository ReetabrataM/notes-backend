import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { workspaceService } from '../services/workspaceService';
import { AuthRequest } from '../middlewares/authenticate';

export const listWorkspaces = asyncHandler(async (req: AuthRequest, res) => {
  const workspaces = await workspaceService.listForUser(req.userId!);
  return ApiResponse.success(res, workspaces, 'Workspaces fetched');
});

export const createWorkspace = asyncHandler(async (req: AuthRequest, res) => {
  const workspace = await workspaceService.create(req.userId!, req.body);
  return ApiResponse.created(res, workspace, 'Workspace created');
});

export const getWorkspace = asyncHandler(async (req: AuthRequest, res) => {
  const workspace = await workspaceService.getById(req.params.id, req.userId!);
  return ApiResponse.success(res, workspace, 'Workspace fetched');
});

export const updateWorkspace = asyncHandler(async (req: AuthRequest, res) => {
  const workspace = await workspaceService.update(req.params.id, req.userId!, req.body);
  return ApiResponse.success(res, workspace, 'Workspace updated');
});

export const inviteMember = asyncHandler(async (req: AuthRequest, res) => {
  const { identifier, role } = req.body;
  const workspace = await workspaceService.inviteMember(req.params.id, req.userId!, identifier, role);
  return ApiResponse.success(res, workspace, 'Member added');
});

export const removeMember = asyncHandler(async (req: AuthRequest, res) => {
  const workspace = await workspaceService.removeMember(req.params.id, req.userId!, req.params.userId);
  return ApiResponse.success(res, workspace, 'Member removed');
});

export const deleteWorkspace = asyncHandler(async (req: AuthRequest, res) => {
  await workspaceService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Workspace deleted');
});
