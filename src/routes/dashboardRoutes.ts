import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.get('/stats', authenticate, dashboardController.getStats);

export default router;
