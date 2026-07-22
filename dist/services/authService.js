"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const UserRepository_1 = require("../repositories/UserRepository");
const SessionRepository_1 = require("../repositories/SessionRepository");
const ActivityLogRepository_1 = require("../repositories/ActivityLogRepository");
const apiResponse_1 = require("../utils/apiResponse");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const User_1 = require("../models/User");
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function refreshExpiryDate() {
    const days = parseInt(env_1.env.jwt.refreshExpiresIn.replace(/[^0-9]/g, ''), 10) || 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
class AuthService {
    async register(input) {
        const existingEmail = await UserRepository_1.userRepository.findByEmail(input.email);
        if (existingEmail)
            throw apiResponse_1.ApiError.conflict('An account with this email already exists');
        const existingUsername = await UserRepository_1.userRepository.findByUsername(input.username);
        if (existingUsername)
            throw apiResponse_1.ApiError.conflict('This username is already taken');
        const user = await UserRepository_1.userRepository.create({
            name: input.name,
            username: input.username.toLowerCase(),
            email: input.email.toLowerCase(),
            password: input.password,
            isEmailVerified: true,
        });
        return user;
    }
    async findOrCreateGoogleUser(profile) {
        let user = await User_1.User.findOne({ googleId: profile.googleId });
        if (user)
            return user;
        user = await UserRepository_1.userRepository.findByEmail(profile.email);
        if (user) {
            user.googleId = profile.googleId;
            user.isEmailVerified = true;
            await user.save();
            return user;
        }
        const baseUsername = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        let username = baseUsername;
        let suffix = 0;
        while (await UserRepository_1.userRepository.findByUsername(username)) {
            suffix += 1;
            username = `${baseUsername}${suffix}`;
        }
        user = (await UserRepository_1.userRepository.create({
            name: profile.name,
            username,
            email: profile.email.toLowerCase(),
            googleId: profile.googleId,
            avatarUrl: profile.avatarUrl,
            isEmailVerified: true,
        }));
        return user;
    }
    async issueTokens(userId, tokenVersion, userAgent = '', ip = '') {
        const accessToken = (0, jwt_1.signAccessToken)({ userId });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId, tokenVersion });
        await SessionRepository_1.sessionRepository.create({
            user: userId,
            refreshTokenHash: hashToken(refreshToken),
            userAgent,
            ip,
            expiresAt: refreshExpiryDate(),
        });
        return { accessToken, refreshToken };
    }
    async login(input) {
        const user = await UserRepository_1.userRepository.findByEmailOrUsername(input.identifier, true);
        if (!user)
            throw apiResponse_1.ApiError.unauthorized('Invalid credentials');
        const isMatch = await user.comparePassword(input.password);
        if (!isMatch)
            throw apiResponse_1.ApiError.unauthorized('Invalid credentials');
        user.lastLoginAt = new Date();
        await user.save();
        await ActivityLogRepository_1.activityLogRepository.log(user._id.toString(), 'logged in', 'auth');
        const tokens = await this.issueTokens(user._id.toString(), user.tokenVersion, input.userAgent, input.ip);
        return { user, ...tokens };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw apiResponse_1.ApiError.unauthorized('Invalid or expired refresh token');
        }
        const session = await SessionRepository_1.sessionRepository.findByHash(payload.userId, hashToken(refreshToken));
        if (!session)
            throw apiResponse_1.ApiError.unauthorized('Session not found. Please log in again');
        const user = await UserRepository_1.userRepository.findById(payload.userId);
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            throw apiResponse_1.ApiError.unauthorized('Session is no longer valid. Please log in again');
        }
        // rotate refresh token
        await SessionRepository_1.sessionRepository.deleteById(session._id.toString());
        const tokens = await this.issueTokens(user._id.toString(), user.tokenVersion);
        return { user, ...tokens };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await SessionRepository_1.sessionRepository.deleteByHash(userId, hashToken(refreshToken));
        }
    }
    async logoutAllDevices(userId) {
        await SessionRepository_1.sessionRepository.deleteAllForUser(userId);
        // bump tokenVersion so any outstanding access tokens' refresh flow is invalidated
        await UserRepository_1.userRepository.updateById(userId, { $inc: { tokenVersion: 1 } });
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await UserRepository_1.userRepository.findById(userId, { select: undefined });
        if (!user)
            throw apiResponse_1.ApiError.notFound('User not found');
        const fullUser = await UserRepository_1.userRepository.findByEmail(user.email, true);
        if (!fullUser)
            throw apiResponse_1.ApiError.notFound('User not found');
        const isMatch = await fullUser.comparePassword(currentPassword);
        if (!isMatch)
            throw apiResponse_1.ApiError.badRequest('Current password is incorrect');
        fullUser.password = newPassword;
        fullUser.tokenVersion += 1;
        await fullUser.save();
        await SessionRepository_1.sessionRepository.deleteAllForUser(userId);
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map