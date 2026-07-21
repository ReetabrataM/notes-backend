import { body, param, query } from 'express-validator';

export const createNoteValidator = [
  body('title').optional().isString().isLength({ max: 200 }),
  body('content').optional().isString(),
  body('plainText').optional().isString(),
  body('folder').optional({ nullable: true }).isMongoId(),
  body('tagNames').optional().isArray(),
  body('color').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'none']),
];

export const updateNoteValidator = [
  param('id').isMongoId(),
  ...createNoteValidator,
];

export const noteIdValidator = [param('id').isMongoId()];

export const listNotesValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  query('folder').optional().isMongoId(),
  query('priority').optional().isIn(['low', 'medium', 'high', 'none']),
  query('tagPrefix').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('hasAttachments').optional().isBoolean(),
  query('attachmentType').optional().isIn(['image', 'pdf', 'document', 'video', 'audio', 'archive']),
];
