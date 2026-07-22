"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const cookieToken = req.cookies?.accessToken;
    const token = bearerToken || cookieToken;
    if (!token) {
        return next(apiResponse_1.ApiError.unauthorized('Authentication required'));
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.userId = payload.userId;
        next();
    }
    catch {
        next(apiResponse_1.ApiError.unauthorized('Invalid or expired access token'));
    }
}
//# sourceMappingURL=authenticate.js.map