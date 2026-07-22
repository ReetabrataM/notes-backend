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
const workspaceController = __importStar(require("../controllers/workspaceController"));
const authenticate_1 = require("../middlewares/authenticate");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', workspaceController.listWorkspaces);
router.post('/', (0, express_validator_1.body)('name').trim().notEmpty().isLength({ max: 100 }), validate_1.validate, workspaceController.createWorkspace);
router.get('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, workspaceController.getWorkspace);
router.patch('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, workspaceController.updateWorkspace);
router.post('/:id/members', (0, express_validator_1.param)('id').isMongoId(), (0, express_validator_1.body)('identifier').notEmpty(), (0, express_validator_1.body)('role').isIn(['admin', 'editor', 'viewer']), validate_1.validate, workspaceController.inviteMember);
router.delete('/:id/members/:userId', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, workspaceController.removeMember);
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId(), validate_1.validate, workspaceController.deleteWorkspace);
exports.default = router;
//# sourceMappingURL=workspaceRoutes.js.map