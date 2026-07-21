import crypto from 'crypto';
import { userRepository } from '../repositories/UserRepository';
import { sessionRepository } from '../repositories/SessionRepository';
import { activityLogRepository } from '../repositories/ActivityLogRepository';
import { ApiError } from '../utils/apiResponse';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import { sendMail, verificationEmailHtml, resetPasswordEmailHtml } from '../emails/mailer';
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

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await userRepository.create({
      name: input.name,
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      password: input.password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    } as any);

    const verifyUrl = `${env.clientUrl}/verify-email?token=${verificationToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your Marginalia account',
      html: verificationEmailHtml(user.name, verifyUrl),
    });

    return user;
  }

  async verifyEmail(token: string) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) throw ApiError.badRequest('Verification link is invalid or has expired');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return user;
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    // Always resolve successfully to avoid leaking which emails are registered
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your Marginalia password',
      html: resetPasswordEmailHtml(user.name, resetUrl),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1;
    await user.save();
    await sessionRepository.deleteAllForUser(user._id.toString());
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

    if (!user.isEmailVerified) {
      throw new ApiError(403, 'Please verify your email before logging in', {
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

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

  async resendVerification(email: string) {
    const user = await userRepository.findByEmail(email);
    // Resolve silently either way to avoid confirming whether an email is registered
    if (!user || user.isEmailVerified) return;

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verifyUrl = `${env.clientUrl}/verify-email?token=${verificationToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your Marginalia account',
      html: verificationEmailHtml(user.name, verifyUrl),
    });
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
