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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const adminController = __importStar(require("../controllers/adminController"));
const authenticate_1 = require("../middlewares/authenticate");
const requireAdmin_1 = require("../middlewares/requireAdmin");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, requireAdmin_1.requireAdmin);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/suspend', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, adminController.suspendUser);
router.delete('/users/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, adminController.deleteUser);
router.get('/stats', adminController.systemStats);
router.get('/activity', adminController.recentActivity);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map