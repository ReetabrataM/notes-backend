import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { dashboardService } from '../services/dashboardService';
import { AuthRequest } from '../middlewares/authenticate';

export const getStats = asyncHandler(async (req: AuthRequest, res) => {
  const stats = await dashboardService.getStats(req.userId!);
  return ApiResponse.success(res, stats, 'Dashboard stats fetched');
});
