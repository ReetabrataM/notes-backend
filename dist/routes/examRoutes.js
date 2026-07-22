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
const examController = __importStar(require("../controllers/examController"));
const authenticate_1 = require("../middlewares/authenticate");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/upcoming', examController.listUpcoming);
router.get('/', examController.listAll);
router.post('/', (0, express_validator_1.body)('subject').trim().notEmpty().isLength({ max: 150 }), (0, express_validator_1.body)('date').isISO8601(), validate_1.validate, examController.createExam);
router.patch('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, examController.updateExam);
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, examController.deleteExam);
exports.default = router;
//# sourceMappingURL=examRoutes.js.map