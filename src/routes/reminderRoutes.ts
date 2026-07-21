import { Router } from 'express';
import { body, param } from 'express-validator';
import * as reminderController from '../controllers/reminderController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/', reminderController.listReminders);
router.post(
  '/',
  body('noteId').isMongoId(),
  body('dueDate').isISO8601(),
  body('recurrence').optional().isIn(['none', 'daily', 'weekly', 'monthly']),
  validate,
  reminderController.createReminder
);
router.post('/:id/complete', param('id').isMongoId(), validate, reminderController.completeReminder);
router.delete('/:id', param('id').isMongoId(), validate, reminderController.deleteReminder);

export default router;
