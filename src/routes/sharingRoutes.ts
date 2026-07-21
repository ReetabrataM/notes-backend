import { Router } from 'express';
import { body, param } from 'express-validator';
import * as sharingController from '../controllers/sharingController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/public/:token', sharingController.getPublicNote);

router.use(authenticate);
router.get('/shared-with-me', sharingController.listSharedWithMe);
router.get('/note/:noteId', param('noteId').isMongoId(), validate, sharingController.getShareSettings);
router.patch(
  '/note/:noteId',
  param('noteId').isMongoId(),
  body('isPublic').isBoolean(),
  body('publicAccess').isIn(['read', 'edit']),
  validate,
  sharingController.updatePublicAccess
);
router.post(
  '/note/:noteId/collaborators',
  param('noteId').isMongoId(),
  body('identifier').notEmpty(),
  body('access').isIn(['read', 'edit']),
  validate,
  sharingController.inviteCollaborator
);
router.delete(
  '/note/:noteId/collaborators/:userId',
  param('noteId').isMongoId(),
  validate,
  sharingController.removeCollaborator
);

export default router;
