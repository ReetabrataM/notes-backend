"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const passport_1 = __importDefault(require("../config/passport"));
const authController = __importStar(require("../controllers/authController"));
const authValidators_1 = require("../validators/authValidators");
const validate_1 = require("../middlewares/validate");
const authenticate_1 = require("../middlewares/authenticate");
const env_1 = require("../config/env");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again later', data: null },
});
router.post('/register', authLimiter, authValidators_1.registerValidator, validate_1.validate, authController.register);
router.post('/login', authLimiter, authValidators_1.loginValidator, validate_1.validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate_1.authenticate, authController.logout);
router.post('/logout-all', authenticate_1.authenticate, authController.logoutAllDevices);
router.post('/change-password', authenticate_1.authenticate, authValidators_1.changePasswordValidator, validate_1.validate, authController.changePassword);
// Google OAuth — only functional once GOOGLE_CLIENT_ID/SECRET are set in backend/.env
router.get('/google', (req, res, next) => {
    if (!env_1.env.googleOAuthConfigured) {
        return next(apiResponse_1.ApiError.badRequest('Google OAuth is not configured on this server yet'));
    }
    passport_1.default.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    if (!env_1.env.googleOAuthConfigured) {
        return next(apiResponse_1.ApiError.badRequest('Google OAuth is not configured on this server yet'));
    }
    passport_1.default.authenticate('google', { session: false, failureRedirect: `${env_1.env.clientUrl}/login` })(req, res, next);
}, authController.googleCallback);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map