import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { studyStatsService } from '../services/studyStatsService';
import { AuthRequest } from '../middlewares/authenticate';

export const getDashboard = asyncHandler(async (req: AuthRequest, res) => {
  const stats = await studyStatsService.getDashboard(req.userId!);
  return ApiResponse.success(res, stats, 'Study stats fetched');
});
