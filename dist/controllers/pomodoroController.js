"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyStats = exports.listRecent = exports.logSession = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const pomodoroService_1 = require("../services/pomodoroService");
exports.logSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const session = await pomodoroService_1.pomodoroService.logSession(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, session, 'Session logged');
});
exports.listRecent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sessions = await pomodoroService_1.pomodoroService.listRecent(req.userId);
    return apiResponse_1.ApiResponse.success(res, sessions, 'Recent sessions fetched');
});
exports.weeklyStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await pomodoroService_1.pomodoroService.weeklyFocusMinutes(req.userId);
    return apiResponse_1.ApiResponse.success(res, stats, 'Weekly stats fetched');
});
//# sourceMappingURL=pomodoroController.js.map