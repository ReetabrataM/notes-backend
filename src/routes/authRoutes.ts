import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from '../config/passport';
import * as authController from '../controllers/authController';
import { registerValidator, loginValidator, changePasswordValidator } from '../validators/authValidators';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { env } from '../config/env';
import { ApiError } from '../utils/apiResponse';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later', data: null },
});

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAllDevices);
router.post(
  '/change-password',
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword
);

router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Google OAuth — only functional once GOOGLE_CLIENT_ID/SECRET are set in backend/.env
router.get('/google', (req, res, next) => {
  if (!env.googleOAuthConfigured) {
    return next(ApiError.badRequest('Google OAuth is not configured on this server yet'));
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!env.googleOAuthConfigured) {
      return next(ApiError.badRequest('Google OAuth is not configured on this server yet'));
    }
    passport.authenticate('google', { session: false, failureRedirect: `${env.clientUrl}/login` })(req, res, next);
  },
  authController.googleCallback
);

export default router;
