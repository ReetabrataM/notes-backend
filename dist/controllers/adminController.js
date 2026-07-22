"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recentActivity = exports.systemStats = exports.deleteUser = exports.suspendUser = exports.listUsers = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const adminService_1 = require("../services/adminService");
exports.listUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, search } = req.query;
    const result = await adminService_1.adminService.listUsers(Number(page) || 1, Number(limit) || 20, search);
    return apiResponse_1.ApiResponse.success(res, result.items, 'Users fetched', 200, result.meta);
});
exports.suspendUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await adminService_1.adminService.suspendUser(req.params.id, req.body.suspended);
    return apiResponse_1.ApiResponse.success(res, user, 'User updated');
});
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await adminService_1.adminService.deleteUser(req.params.id);
    return apiResponse_1.ApiResponse.noContent(res, 'User deleted');
});
exports.systemStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await adminService_1.adminService.systemStats();
    return apiResponse_1.ApiResponse.success(res, stats, 'System stats fetched');
});
exports.recentActivity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const activity = await adminService_1.adminService.recentActivity(50);
    return apiResponse_1.ApiResponse.success(res, activity, 'Recent activity fetched');
});
//# sourceMappingURL=adminController.js.map