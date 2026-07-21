import { Router } from 'express';
import { body } from 'express-validator';
import * as pomodoroController from '../controllers/pomodoroController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/recent', pomodoroController.listRecent);
router.get('/weekly-stats', pomodoroController.weeklyStats);
router.post(
  '/',
  body('type').isIn(['focus', 'break']),
  body('durationMinutes').isFloat({ min: 0.1 }),
  body('startedAt').isISO8601(),
  validate,
  pomodoroController.logSession
);

export default router;
