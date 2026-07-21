import { Router } from 'express';
import { param } from 'express-validator';
import * as versionController from '../controllers/versionController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/note/:noteId', param('noteId').isMongoId(), validate, versionController.listVersions);
router.post(
  '/note/:noteId/restore/:versionId',
  param('noteId').isMongoId(),
  param('versionId').isMongoId(),
  validate,
  versionController.restoreVersion
);

export default router;
