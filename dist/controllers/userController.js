"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const userService_1 = require("../services/userService");
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userService_1.userService.getProfile(req.userId);
    return apiResponse_1.ApiResponse.success(res, user, 'Profile fetched');
});
exports.updateMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userService_1.userService.updateProfile(req.userId, req.body);
    return apiResponse_1.ApiResponse.success(res, user, 'Profile updated');
});
//# sourceMappingURL=userController.js.map