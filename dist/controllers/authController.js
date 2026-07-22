"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.googleCallback = exports.logoutAllDevices = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const authService_1 = require("../services/authService");
const env_1 = require("../config/env");
function cookieOptions(maxAgeMs) {
    return {
        httpOnly: true,
        secure: env_1.env.isProd,
        sameSite: env_1.env.isProd ? 'strict' : 'lax',
        maxAge: maxAgeMs,
    };
}
function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, cookieOptions(30 * 24 * 60 * 60 * 1000));
}
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await authService_1.authService.register(req.body);
    return apiResponse_1.ApiResponse.created(res, {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
    }, 'Account created successfully. You can now log in');
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { identifier, password, rememberMe } = req.body;
    const { user, accessToken, refreshToken } = await authService_1.authService.login({
        identifier,
        password,
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip,
    });
    setAuthCookies(res, accessToken, refreshToken);
    return apiResponse_1.ApiResponse.success(res, {
        user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            themePreference: user.themePreference,
            role: user.role,
        },
        accessToken,
        ...(rememberMe ? { refreshToken } : {}),
    }, 'Logged in successfully');
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token)
        throw apiResponse_1.ApiError.unauthorized('Refresh token missing');
    const { user, accessToken, refreshToken } = await authService_1.authService.refresh(token);
    setAuthCookies(res, accessToken, refreshToken);
    return apiResponse_1.ApiResponse.success(res, { accessToken, userId: user._id }, 'Token refreshed');
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (req.userId) {
        await authService_1.authService.logout(req.userId, token);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return apiResponse_1.ApiResponse.success(res, null, 'Logged out successfully');
});
exports.logoutAllDevices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await authService_1.authService.logoutAllDevices(req.userId);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return apiResponse_1.ApiResponse.success(res, null, 'Logged out from all devices');
});
exports.googleCallback = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const tokens = await authService_1.authService.issueTokens(user._id.toString(), user.tokenVersion);
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: env_1.env.isProd,
        sameSite: env_1.env.isProd ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env_1.env.isProd,
        sameSite: env_1.env.isProd ? 'strict' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${env_1.env.clientUrl}/oauth-success?accessToken=${tokens.accessToken}`);
});
exports.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService_1.authService.changePassword(req.userId, currentPassword, newPassword);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return apiResponse_1.ApiResponse.success(res, null, 'Password changed. Please log in again');
});
//# sourceMappingURL=authController.js.map