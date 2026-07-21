import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { pomodoroService } from '../services/pomodoroService';
import { AuthRequest } from '../middlewares/authenticate';

export const logSession = asyncHandler(async (req: AuthRequest, res) => {
  const session = await pomodoroService.logSession(req.userId!, req.body);
  return ApiResponse.created(res, session, 'Session logged');
});

export const listRecent = asyncHandler(async (req: AuthRequest, res) => {
  const sessions = await pomodoroService.listRecent(req.userId!);
  return ApiResponse.success(res, sessions, 'Recent sessions fetched');
});

export const weeklyStats = asyncHandler(async (req: AuthRequest, res) => {
  const stats = await pomodoroService.weeklyFocusMinutes(req.userId!);
  return ApiResponse.success(res, stats, 'Weekly stats fetched');
});
