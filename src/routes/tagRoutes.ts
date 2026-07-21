import { Router } from 'express';
import { body, param } from 'express-validator';
import * as tagController from '../controllers/tagController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', tagController.listTags);
router.post('/', body('name').trim().notEmpty().isLength({ max: 50 }), validate, tagController.createTag);
router.delete('/:id', param('id').isMongoId(), validate, tagController.deleteTag);

export default router;
