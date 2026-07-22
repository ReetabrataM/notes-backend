"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    mongoUri: required('MONGO_URI'),
    jwt: {
        accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
        refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret_change_me',
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
    },
    // --- Optional third-party integrations ---
    // Resend HTTP API for production email sending
    resendApiKey: process.env.RESEND_API_KEY || '',
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    smtp: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        fromEmail: process.env.SMTP_FROM_EMAIL || 'no-reply@marginalia.app',
    },
    googleOAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
    },
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    ai: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
        embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    },
    isProd: process.env.NODE_ENV === 'production',
};
//# sourceMappingURL=env.js.map