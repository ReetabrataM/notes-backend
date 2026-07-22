"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('username')
        .trim()
        .toLowerCase()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters')
        .matches(/^[a-z0-9_]+$/)
        .withMessage('Username can only contain lowercase letters, numbers, and underscores'),
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
];
exports.loginValidator = [
    (0, express_validator_1.body)('identifier').trim().notEmpty().withMessage('Email or username is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
exports.changePasswordValidator = [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
        .matches(/\d/)
        .withMessage('New password must contain at least one number'),
];
//# sourceMappingURL=authValidators.js.map