"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const studyStatsService_1 = require("../services/studyStatsService");
exports.getDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await studyStatsService_1.studyStatsService.getDashboard(req.userId);
    return apiResponse_1.ApiResponse.success(res, stats, 'Study stats fetched');
});
//# sourceMappingURL=studyStatsController.js.map