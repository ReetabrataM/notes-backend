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
const sharingController = __importStar(require("../controllers/sharingController"));
const authenticate_1 = require("../middlewares/authenticate");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.get('/public/:token', sharingController.getPublicNote);
router.use(authenticate_1.authenticate);
router.get('/shared-with-me', sharingController.listSharedWithMe);
router.get('/note/:noteId', (0, express_validator_1.param)('noteId').isMongoId(), validate_1.validate, sharingController.getShareSettings);
router.patch('/note/:noteId', (0, express_validator_1.param)('noteId').isMongoId(), (0, express_validator_1.body)('isPublic').isBoolean(), (0, express_validator_1.body)('publicAccess').isIn(['read', 'edit']), validate_1.validate, sharingController.updatePublicAccess);
router.post('/note/:noteId/collaborators', (0, express_validator_1.param)('noteId').isMongoId(), (0, express_validator_1.body)('identifier').notEmpty(), (0, express_validator_1.body)('access').isIn(['read', 'edit']), validate_1.validate, sharingController.inviteCollaborator);
router.delete('/note/:noteId/collaborators/:userId', (0, express_validator_1.param)('noteId').isMongoId(), validate_1.validate, sharingController.removeCollaborator);
exports.default = router;
//# sourceMappingURL=sharingRoutes.js.map