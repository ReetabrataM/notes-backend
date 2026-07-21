import { Router } from 'express';
import * as studyStatsController from '../controllers/studyStatsController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.get('/dashboard', authenticate, studyStatsController.getDashboard);

export default router;
