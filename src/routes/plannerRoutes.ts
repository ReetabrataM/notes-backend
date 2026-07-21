import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as plannerController from '../controllers/plannerController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/range', query('start').isISO8601(), query('end').isISO8601(), validate, plannerController.listRange);
router.get('/upcoming', plannerController.listUpcoming);
router.post(
  '/',
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('date').isISO8601(),
  body('type').optional().isIn(['study', 'task', 'reminder']),
  body('recurrence').optional().isIn(['none', 'daily', 'weekly', 'monthly']),
  validate,
  plannerController.createEvent
);
router.patch('/:id', param('id').isMongoId(), validate, plannerController.updateEvent);
router.patch(
  '/:id/reschedule',
  param('id').isMongoId(),
  body('date').isISO8601(),
  validate,
  plannerController.rescheduleEvent
);
router.post('/:id/complete', param('id').isMongoId(), validate, plannerController.toggleComplete);
router.delete('/:id', param('id').isMongoId(), validate, plannerController.deleteEvent);

export default router;
