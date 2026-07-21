import { Router } from 'express';
import { body, param } from 'express-validator';
import * as folderController from '../controllers/folderController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', folderController.listFolders);
router.post(
  '/',
  body('name').trim().notEmpty().isLength({ max: 100 }),
  validate,
  folderController.createFolder
);
router.patch('/:id', param('id').isMongoId(), validate, folderController.updateFolder);
router.delete('/:id', param('id').isMongoId(), validate, folderController.deleteFolder);

export default router;
