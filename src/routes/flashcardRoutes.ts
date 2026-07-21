import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as flashcardController from '../controllers/flashcardController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(authenticate);

router.get('/due', query('deckName').optional().isString(), validate, flashcardController.listDue);
router.get('/decks', flashcardController.listDecks);
router.get('/counts', flashcardController.getCounts);
router.get('/note/:noteId', param('noteId').isMongoId(), validate, flashcardController.listByNote);

router.post(
  '/generate/:noteId',
  param('noteId').isMongoId(),
  body('deckName').optional().isString(),
  validate,
  flashcardController.generateFromNote
);
router.post(
  '/',
  body('front').trim().notEmpty(),
  body('back').trim().notEmpty(),
  validate,
  flashcardController.createManual
);
router.post(
  '/:id/review',
  param('id').isMongoId(),
  body('quality').isInt({ min: 0, max: 5 }),
  validate,
  flashcardController.reviewCard
);
router.delete('/:id', param('id').isMongoId(), validate, flashcardController.deleteCard);

export default router;
