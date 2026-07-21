import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import * as reetaiController from '../controllers/reetaiController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

// ReetAI calls the OpenAI API on every request, so it gets a tighter rate limit
// than the rest of the app to bound cost from any single account.
const reetaiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.post('/search', reetaiLimiter, body('query').isString(), validate, reetaiController.search);
router.post('/chat', reetaiLimiter, body('message').isString(), validate, reetaiController.chat);
router.post('/agent/plan', reetaiLimiter, body('instruction').isString(), validate, reetaiController.planTask);
router.post('/agent/execute', reetaiLimiter, body('plan').isArray(), validate, reetaiController.executePlan);

export default router;
