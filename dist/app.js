"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const passport_1 = __importDefault(require("./config/passport"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xss = require('xss-clean');
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use((0, cors_1.default)({
        origin: env_1.env.clientUrl,
        credentials: true,
    }));
    app.use((0, hpp_1.default)());
    app.use((0, express_mongo_sanitize_1.default)());
    app.use(xss());
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)(env_1.env.cookieSecret));
    app.use(passport_1.default.initialize());
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
    app.use((0, express_rate_limit_1.default)({
        windowMs: env_1.env.rateLimit.windowMs,
        max: env_1.env.rateLimit.max,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    if (!env_1.env.isProd) {
        app.use((0, morgan_1.default)('dev'));
    }
    app.use('/api/v1', routes_1.default);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map