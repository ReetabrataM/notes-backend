import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { authService } from '../services/authService';
import { AuthRequest } from '../middlewares/authenticate';
import { env } from '../config/env';

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? ('strict' as const) : ('lax' as const),
    maxAge: maxAgeMs,
  };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, cookieOptions(30 * 24 * 60 * 60 * 1000));
}

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return ApiResponse.created(res, {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  }, 'Account created successfully. You can now log in');
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password, rememberMe } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({
    identifier,
    password,
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
  });

  setAuthCookies(res, accessToken, refreshToken);

  return ApiResponse.success(res, {
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

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw ApiError.unauthorized('Refresh token missing');

  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setAuthCookies(res, accessToken, refreshToken);

  return ApiResponse.success(res, { accessToken, userId: user._id }, 'Token refreshed');
});

export const logout = asyncHandler(async (req: AuthRequest, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (req.userId) {
    await authService.logout(req.userId, token);
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return ApiResponse.success(res, null, 'Logged out successfully');
});

export const logoutAllDevices = asyncHandler(async (req: AuthRequest, res) => {
  await authService.logoutAllDevices(req.userId!);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return ApiResponse.success(res, null, 'Logged out from all devices');
});

export const googleCallback = asyncHandler(async (req: any, res) => {
  const user = req.user;
  const tokens = await authService.issueTokens(user._id.toString(), user.tokenVersion);
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.redirect(`${env.clientUrl}/oauth-success?accessToken=${tokens.accessToken}`);
});

export const changePassword = asyncHandler(async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.userId!, currentPassword, newPassword);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return ApiResponse.success(res, null, 'Password changed. Please log in again');
});