"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotesValidator = exports.noteIdValidator = exports.updateNoteValidator = exports.createNoteValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createNoteValidator = [
    (0, express_validator_1.body)('title').optional().isString().isLength({ max: 200 }),
    (0, express_validator_1.body)('content').optional().isString(),
    (0, express_validator_1.body)('plainText').optional().isString(),
    (0, express_validator_1.body)('folder').optional({ nullable: true }).isMongoId(),
    (0, express_validator_1.body)('tagNames').optional().isArray(),
    (0, express_validator_1.body)('color').optional().isString(),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'none']),
];
exports.updateNoteValidator = [
    (0, express_validator_1.param)('id').isMongoId(),
    ...exports.createNoteValidator,
];
exports.noteIdValidator = [(0, express_validator_1.param)('id').isMongoId()];
exports.listNotesValidator = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('folder').optional().isMongoId(),
    (0, express_validator_1.query)('priority').optional().isIn(['low', 'medium', 'high', 'none']),
    (0, express_validator_1.query)('tagPrefix').optional().isString(),
    (0, express_validator_1.query)('dateFrom').optional().isISO8601(),
    (0, express_validator_1.query)('dateTo').optional().isISO8601(),
    (0, express_validator_1.query)('hasAttachments').optional().isBoolean(),
    (0, express_validator_1.query)('attachmentType').optional().isIn(['image', 'pdf', 'document', 'video', 'audio', 'archive']),
];
//# sourceMappingURL=noteValidators.js.map