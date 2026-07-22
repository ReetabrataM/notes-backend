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
const plannerController = __importStar(require("../controllers/plannerController"));
const authenticate_1 = require("../middlewares/authenticate");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/range', (0, express_validator_1.query)('start').isISO8601(), (0, express_validator_1.query)('end').isISO8601(), validate_1.validate, plannerController.listRange);
router.get('/upcoming', plannerController.listUpcoming);
router.post('/', (0, express_validator_1.body)('title').trim().notEmpty().isLength({ max: 200 }), (0, express_validator_1.body)('date').isISO8601(), (0, express_validator_1.body)('type').optional().isIn(['study', 'task', 'reminder']), (0, express_validator_1.body)('recurrence').optional().isIn(['none', 'daily', 'weekly', 'monthly']), validate_1.validate, plannerController.createEvent);
router.patch('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, plannerController.updateEvent);
router.patch('/:id/reschedule', (0, express_validator_1.param)('id').isMongoId(), (0, express_validator_1.body)('date').isISO8601(), validate_1.validate, plannerController.rescheduleEvent);
router.post('/:id/complete', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, plannerController.toggleComplete);
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, plannerController.deleteEvent);
exports.default = router;
//# sourceMappingURL=plannerRoutes.js.map