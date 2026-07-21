import { Router } from 'express';
import { body, param } from 'express-validator';
import * as examController from '../controllers/examController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/upcoming', examController.listUpcoming);
router.get('/', examController.listAll);
router.post(
  '/',
  body('subject').trim().notEmpty().isLength({ max: 150 }),
  body('date').isISO8601(),
  validate,
  examController.createExam
);
router.patch('/:id', param('id').isMongoId(), validate, examController.updateExam);
router.delete('/:id', param('id').isMongoId(), validate, examController.deleteExam);

export default router;
