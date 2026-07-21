import { Router } from 'express';
import { body, param } from 'express-validator';
import * as workspaceController from '../controllers/workspaceController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/', workspaceController.listWorkspaces);
router.post('/', body('name').trim().notEmpty().isLength({ max: 100 }), validate, workspaceController.createWorkspace);
router.get('/:id', param('id').isMongoId(), validate, workspaceController.getWorkspace);
router.patch('/:id', param('id').isMongoId(), validate, workspaceController.updateWorkspace);
router.post(
  '/:id/members',
  param('id').isMongoId(),
  body('identifier').notEmpty(),
  body('role').isIn(['admin', 'editor', 'viewer']),
  validate,
  workspaceController.inviteMember
);
router.delete('/:id/members/:userId', param('id').isMongoId(), validate, workspaceController.removeMember);
router.delete('/:id', param('id').isMongoId(), validate, workspaceController.deleteWorkspace);

export default router;
