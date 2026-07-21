import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { notificationService } from '../services/notificationService';
import { AuthRequest } from '../middlewares/authenticate';

export const listNotifications = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const result = await notificationService.list(req.userId!, page, 20);
  return ApiResponse.success(res, result.items, 'Notifications fetched', 200, {
    page,
    limit: 20,
    total: result.total,
    totalPages: Math.ceil(result.total / 20),
    unreadCount: result.unreadCount,
  } as any);
});

export const markRead = asyncHandler(async (req: AuthRequest, res) => {
  const notification = await notificationService.markRead(req.params.id, req.userId!);
  return ApiResponse.success(res, notification, 'Notification marked read');
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res) => {
  await notificationService.markAllRead(req.userId!);
  return ApiResponse.success(res, null, 'All notifications marked read');
});
