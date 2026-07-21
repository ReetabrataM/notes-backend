import { Router } from 'express';
import { param } from 'express-validator';
import * as notificationController from '../controllers/notificationController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/', notificationController.listNotifications);
router.post('/:id/read', param('id').isMongoId(), validate, notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;
