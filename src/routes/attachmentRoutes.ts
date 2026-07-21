import { Router } from 'express';
import { param, body } from 'express-validator';
import * as attachmentController from '../controllers/attachmentController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { upload } from '../config/multer';

const router = Router();
router.use(authenticate);

router.get('/note/:noteId', param('noteId').isMongoId(), validate, attachmentController.listAttachments);
router.post(
  '/note/:noteId',
  param('noteId').isMongoId(),
  validate,
  upload.single('file'),
  attachmentController.uploadAttachment
);
router.post(
  '/note/:noteId/bulk',
  param('noteId').isMongoId(),
  validate,
  upload.array('files', 10),
  attachmentController.uploadAttachmentsBulk
);
router.patch(
  '/:id',
  param('id').isMongoId(),
  body('originalName').trim().notEmpty().isLength({ max: 255 }),
  validate,
  attachmentController.renameAttachment
);
router.patch(
  '/note/:noteId/reorder',
  param('noteId').isMongoId(),
  body('orderedIds').isArray(),
  validate,
  attachmentController.reorderAttachments
);
router.delete('/:id', param('id').isMongoId(), validate, attachmentController.deleteAttachment);

export default router;
