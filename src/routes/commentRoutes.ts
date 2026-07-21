import { Router } from 'express';
import { body, param } from 'express-validator';
import * as commentController from '../controllers/commentController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/note/:noteId', param('noteId').isMongoId(), validate, commentController.listComments);
router.post(
  '/note/:noteId',
  param('noteId').isMongoId(),
  body('content').trim().notEmpty().isLength({ max: 2000 }),
  validate,
  commentController.createComment
);
router.delete('/:id', param('id').isMongoId(), validate, commentController.deleteComment);

export default router;
