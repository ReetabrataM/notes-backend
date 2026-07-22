"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const authService_1 = require("../services/authService");
// Google OAuth only activates if GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are set in .env.
// Without them, the /auth/google routes will respond with a clear 501 instead of crashing.
if (env_1.env.googleOAuthConfigured) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.google.clientId,
        clientSecret: env_1.env.google.clientSecret,
        callbackURL: env_1.env.google.callbackUrl,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email)
                return done(new Error('Google account has no email'), undefined);
            const user = await authService_1.authService.findOrCreateGoogleUser({
                googleId: profile.id,
                email,
                name: profile.displayName || email.split('@')[0],
                avatarUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
        }
        catch (err) {
            done(err, undefined);
        }
    }));
}
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map