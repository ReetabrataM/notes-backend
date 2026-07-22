"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const dashboardService_1 = require("../services/dashboardService");
exports.getStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await dashboardService_1.dashboardService.getStats(req.userId);
    return apiResponse_1.ApiResponse.success(res, stats, 'Dashboard stats fetched');
});
//# sourceMappingURL=dashboardController.js.map