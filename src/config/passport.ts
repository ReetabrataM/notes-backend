import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { authService } from '../services/authService';

// Google OAuth only activates if GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are set in .env.
// Without them, the /auth/google routes will respond with a clear 501 instead of crashing.
if (env.googleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('Google account has no email'), undefined);

          const user = await authService.findOrCreateGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName || email.split('@')[0],
            avatarUrl: profile.photos?.[0]?.value,
          });
          done(null, user as any);
        } catch (err) {
          done(err as Error, undefined);
        }
      }
    )
  );
}

export default passport;
