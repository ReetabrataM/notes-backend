import crypto from 'crypto';
import { userRepository } from '../repositories/UserRepository';
import { sessionRepository } from '../repositories/SessionRepository';
import { activityLogRepository } from '../repositories/ActivityLogRepository';
import { ApiError } from '../utils/apiResponse';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import { User } from '../models/User';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshExpiryDate(): Date {
  const days = parseInt(env.jwt.refreshExpiresIn.replace(/[^0-9]/g, ''), 10) || 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  identifier: string; // email or username
  password: string;
  userAgent?: string;
  ip?: string;
}

class AuthService {
  async register(input: RegisterInput) {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) throw ApiError.conflict('An account with this email already exists');

    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) throw ApiError.conflict('This username is already taken');

    const user = await userRepository.create({
      name: input.name,
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      password: input.password,
      isEmailVerified: true,
    } as any);

    return user;
  }

  async findOrCreateGoogleUser(profile: { googleId: string; email: string; name: string; avatarUrl?: string }) {
    let user = await User.findOne({ googleId: profile.googleId });
    if (user) return user;

    user = await userRepository.findByEmail(profile.email);
    if (user) {
      user.googleId = profile.googleId;
      user.isEmailVerified = true;
      await user.save();
      return user;
    }

    const baseUsername = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    let username = baseUsername;
    let suffix = 0;
    while (await userRepository.findByUsername(username)) {
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }

    user = (await userRepository.create({
      name: profile.name,
      username,
      email: profile.email.toLowerCase(),
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl,
      isEmailVerified: true,
    } as any)) as any;

    return user;
  }

  async issueTokens(userId: string, tokenVersion: number, userAgent = '', ip = '') {
    const accessToken = signAccessToken({ userId });
    const refreshToken = signRefreshToken({ userId, tokenVersion });

    await sessionRepository.create({
      user: userId as any,
      refreshTokenHash: hashToken(refreshToken),
      userAgent,
      ip,
      expiresAt: refreshExpiryDate(),
    } as any);

    return { accessToken, refreshToken };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmailOrUsername(input.identifier, true);
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

    user.lastLoginAt = new Date();
    await user.save();
    await activityLogRepository.log(user._id.toString(), 'logged in', 'auth');

    const tokens = await this.issueTokens(
      user._id.toString(),
      user.tokenVersion,
      input.userAgent,
      input.ip
    );

    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const session = await sessionRepository.findByHash(payload.userId, hashToken(refreshToken));
    if (!session) throw ApiError.unauthorized('Session not found. Please log in again');

    const user = await userRepository.findById(payload.userId);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Session is no longer valid. Please log in again');
    }

    // rotate refresh token
    await sessionRepository.deleteById(session._id.toString());
    const tokens = await this.issueTokens(user._id.toString(), user.tokenVersion);

    return { user, ...tokens };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await sessionRepository.deleteByHash(userId, hashToken(refreshToken));
    }
  }

  async logoutAllDevices(userId: string) {
    await sessionRepository.deleteAllForUser(userId);
    // bump tokenVersion so any outstanding access tokens' refresh flow is invalidated
    await userRepository.updateById(userId, { $inc: { tokenVersion: 1 } } as any);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId, { select: undefined });
    if (!user) throw ApiError.notFound('User not found');

    const fullUser = await userRepository.findByEmail(user.email, true);
    if (!fullUser) throw ApiError.notFound('User not found');

    const isMatch = await fullUser.comparePassword(currentPassword);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    fullUser.password = newPassword;
    fullUser.tokenVersion += 1;
    await fullUser.save();
    await sessionRepository.deleteAllForUser(userId);
  }
}

export const authService = new AuthService();