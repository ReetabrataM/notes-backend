import { Router } from 'express';
import { body, param } from 'express-validator';
import * as savedSearchController from '../controllers/savedSearchController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/', savedSearchController.listSavedSearches);
router.post('/', body('name').trim().notEmpty().isLength({ max: 100 }), validate, savedSearchController.createSavedSearch);
router.patch('/:id', param('id').isMongoId(), validate, savedSearchController.updateSavedSearch);
router.delete('/:id', param('id').isMongoId(), validate, savedSearchController.deleteSavedSearch);

export default router;
