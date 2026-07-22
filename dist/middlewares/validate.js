"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const express_validator_1 = require("express-validator");
const apiResponse_1 = require("../utils/apiResponse");
function validate(req, _res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(apiResponse_1.ApiError.badRequest('Validation failed', errors.array()));
    }
    next();
}
//# sourceMappingURL=validate.js.map