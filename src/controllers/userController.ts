import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { userService } from '../services/userService';
import { AuthRequest } from '../middlewares/authenticate';

export const getMe = asyncHandler(async (req: AuthRequest, res) => {
  const user = await userService.getProfile(req.userId!);
  return ApiResponse.success(res, user, 'Profile fetched');
});

export const updateMe = asyncHandler(async (req: AuthRequest, res) => {
  const user = await userService.updateProfile(req.userId!, req.body);
  return ApiResponse.success(res, user, 'Profile updated');
});
