import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);

export default router;
