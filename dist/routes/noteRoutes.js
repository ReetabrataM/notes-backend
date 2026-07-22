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
const noteController = __importStar(require("../controllers/noteController"));
const noteValidators_1 = require("../validators/noteValidators");
const validate_1 = require("../middlewares/validate");
const authenticate_1 = require("../middlewares/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', noteValidators_1.listNotesValidator, validate_1.validate, noteController.listNotes);
router.get('/search', noteController.searchByTitle); // must come before /:id — otherwise "/search" itself gets matched as an :id
router.post('/', noteValidators_1.createNoteValidator, validate_1.validate, noteController.createNote);
router.get('/:id', noteValidators_1.noteIdValidator, validate_1.validate, noteController.getNote);
router.get('/:id/backlinks', noteValidators_1.noteIdValidator, validate_1.validate, noteController.getBacklinks);
router.patch('/:id', noteValidators_1.updateNoteValidator, validate_1.validate, noteController.updateNote);
router.delete('/:id', noteValidators_1.noteIdValidator, validate_1.validate, noteController.softDeleteNote);
router.post('/:id/restore', noteValidators_1.noteIdValidator, validate_1.validate, noteController.restoreNote);
router.delete('/:id/permanent', noteValidators_1.noteIdValidator, validate_1.validate, noteController.permanentDeleteNote);
router.post('/:id/pin', noteValidators_1.noteIdValidator, validate_1.validate, noteController.togglePin);
router.post('/:id/archive', noteValidators_1.noteIdValidator, validate_1.validate, noteController.toggleArchive);
router.post('/:id/favorite', noteValidators_1.noteIdValidator, validate_1.validate, noteController.toggleFavorite);
router.post('/:id/duplicate', noteValidators_1.noteIdValidator, validate_1.validate, noteController.duplicateNote);
router.post('/bulk/delete', noteController.bulkDelete);
router.post('/bulk/archive', noteController.bulkArchive);
router.post('/bulk/tag', noteController.bulkTag);
exports.default = router;
//# sourceMappingURL=noteRoutes.js.map