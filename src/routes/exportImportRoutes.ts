import { Router } from 'express';
import { param } from 'express-validator';
import * as exportImportController from '../controllers/exportImportController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { uploadMemory } from '../config/multer';

const router = Router();
router.use(authenticate);

router.get('/notes/:id/markdown', param('id').isMongoId(), validate, exportImportController.exportMarkdown);
router.get('/notes/:id/pdf', param('id').isMongoId(), validate, exportImportController.exportPdf);
router.get('/notes/:id/docx', param('id').isMongoId(), validate, exportImportController.exportDocx);
router.post('/notes/import/markdown', uploadMemory.single('file'), exportImportController.importMarkdown);

export default router;
