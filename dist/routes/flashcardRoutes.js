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
const flashcardController = __importStar(require("../controllers/flashcardController"));
const authenticate_1 = require("../middlewares/authenticate");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/due', (0, express_validator_1.query)('deckName').optional().isString(), validate_1.validate, flashcardController.listDue);
router.get('/decks', flashcardController.listDecks);
router.get('/counts', flashcardController.getCounts);
router.get('/note/:noteId', (0, express_validator_1.param)('noteId').isMongoId(), validate_1.validate, flashcardController.listByNote);
router.post('/generate/:noteId', (0, express_validator_1.param)('noteId').isMongoId(), (0, express_validator_1.body)('deckName').optional().isString(), validate_1.validate, flashcardController.generateFromNote);
router.post('/', (0, express_validator_1.body)('front').trim().notEmpty(), (0, express_validator_1.body)('back').trim().notEmpty(), validate_1.validate, flashcardController.createManual);
router.post('/:id/review', (0, express_validator_1.param)('id').isMongoId(), (0, express_validator_1.body)('quality').isInt({ min: 0, max: 5 }), validate_1.validate, flashcardController.reviewCard);
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, flashcardController.deleteCard);
exports.default = router;
//# sourceMappingURL=flashcardRoutes.js.map