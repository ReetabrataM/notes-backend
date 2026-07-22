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
const exportImportController = __importStar(require("../controllers/exportImportController"));
const authenticate_1 = require("../middlewares/authenticate");
const validate_1 = require("../middlewares/validate");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/notes/:id/markdown', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, exportImportController.exportMarkdown);
router.get('/notes/:id/pdf', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, exportImportController.exportPdf);
router.get('/notes/:id/docx', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, exportImportController.exportDocx);
router.post('/notes/import/markdown', multer_1.uploadMemory.single('file'), exportImportController.importMarkdown);
exports.default = router;
//# sourceMappingURL=exportImportRoutes.js.map