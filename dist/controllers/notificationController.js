"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markRead = exports.listNotifications = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const notificationService_1 = require("../services/notificationService");
exports.listNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const result = await notificationService_1.notificationService.list(req.userId, page, 20);
    return apiResponse_1.ApiResponse.success(res, result.items, 'Notifications fetched', 200, {
        page,
        limit: 20,
        total: result.total,
        totalPages: Math.ceil(result.total / 20),
        unreadCount: result.unreadCount,
    });
});
exports.markRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notification = await notificationService_1.notificationService.markRead(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, notification, 'Notification marked read');
});
exports.markAllRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await notificationService_1.notificationService.markAllRead(req.userId);
    return apiResponse_1.ApiResponse.success(res, null, 'All notifications marked read');
});
//# sourceMappingURL=notificationController.js.map