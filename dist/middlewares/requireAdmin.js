"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
const UserRepository_1 = require("../repositories/UserRepository");
const apiResponse_1 = require("../utils/apiResponse");
async function requireAdmin(req, _res, next) {
    try {
        const user = await UserRepository_1.userRepository.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return next(apiResponse_1.ApiError.forbidden('Admin access required'));
        }
        next();
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=requireAdmin.js.map