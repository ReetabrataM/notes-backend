import { Router } from 'express';
import { param } from 'express-validator';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/users', adminController.listUsers);
router.patch('/users/:id/suspend', param('id').isMongoId(), validate, adminController.suspendUser);
router.delete('/users/:id', param('id').isMongoId(), validate, adminController.deleteUser);
router.get('/stats', adminController.systemStats);
router.get('/activity', adminController.recentActivity);

export default router;
