import { Router } from 'express';
import * as noteController from '../controllers/noteController';
import {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
  listNotesValidator,
} from '../validators/noteValidators';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', listNotesValidator, validate, noteController.listNotes);
router.get('/search', noteController.searchByTitle); // must come before /:id — otherwise "/search" itself gets matched as an :id
router.post('/', createNoteValidator, validate, noteController.createNote);
router.get('/:id', noteIdValidator, validate, noteController.getNote);
router.get('/:id/backlinks', noteIdValidator, validate, noteController.getBacklinks);
router.patch('/:id', updateNoteValidator, validate, noteController.updateNote);
router.delete('/:id', noteIdValidator, validate, noteController.softDeleteNote);
router.post('/:id/restore', noteIdValidator, validate, noteController.restoreNote);
router.delete('/:id/permanent', noteIdValidator, validate, noteController.permanentDeleteNote);
router.post('/:id/pin', noteIdValidator, validate, noteController.togglePin);
router.post('/:id/archive', noteIdValidator, validate, noteController.toggleArchive);
router.post('/:id/favorite', noteIdValidator, validate, noteController.toggleFavorite);
router.post('/:id/duplicate', noteIdValidator, validate, noteController.duplicateNote);
router.post('/bulk/delete', noteController.bulkDelete);
router.post('/bulk/archive', noteController.bulkArchive);
router.post('/bulk/tag', noteController.bulkTag);

export default router;
