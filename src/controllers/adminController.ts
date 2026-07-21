import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { adminService } from '../services/adminService';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query as Record<string, string>;
  const result = await adminService.listUsers(Number(page) || 1, Number(limit) || 20, search);
  return ApiResponse.success(res, result.items, 'Users fetched', 200, result.meta);
});

export const suspendUser = asyncHandler(async (req, res) => {
  const user = await adminService.suspendUser(req.params.id, req.body.suspended);
  return ApiResponse.success(res, user, 'User updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  return ApiResponse.noContent(res, 'User deleted');
});

export const systemStats = asyncHandler(async (req, res) => {
  const stats = await adminService.systemStats();
  return ApiResponse.success(res, stats, 'System stats fetched');
});

export const recentActivity = asyncHandler(async (req, res) => {
  const activity = await adminService.recentActivity(50);
  return ApiResponse.success(res, activity, 'Recent activity fetched');
});
