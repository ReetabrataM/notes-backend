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
const express_validator_1 = require("express-validator");
const reetaiController = __importStar(require("../controllers/reetaiController"));
const authenticate_1 = require("../middlewares/authenticate");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// ReetAI calls the OpenAI API on every request, so it gets a tighter rate limit
// than the rest of the app to bound cost from any single account.
const reetaiLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, max: 20 });
router.post('/search', reetaiLimiter, (0, express_validator_1.body)('query').isString(), validate_1.validate, reetaiController.search);
router.post('/chat', reetaiLimiter, (0, express_validator_1.body)('message').isString(), validate_1.validate, reetaiController.chat);
router.post('/agent/plan', reetaiLimiter, (0, express_validator_1.body)('instruction').isString(), validate_1.validate, reetaiController.planTask);
router.post('/agent/execute', reetaiLimiter, (0, express_validator_1.body)('plan').isArray(), validate_1.validate, reetaiController.executePlan);
exports.default = router;
//# sourceMappingURL=reetaiRoutes.js.map