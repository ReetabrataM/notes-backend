import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { flashcardService } from '../services/flashcardService';
import { AuthRequest } from '../middlewares/authenticate';

export const generateFromNote = asyncHandler(async (req: AuthRequest, res) => {
  const cards = await flashcardService.generateFromNote(req.params.noteId, req.userId!, req.body.deckName);
  return ApiResponse.created(res, cards, 'Flashcards generated');
});

export const createManual = asyncHandler(async (req: AuthRequest, res) => {
  const card = await flashcardService.createManual(req.userId!, req.body);
  return ApiResponse.created(res, card, 'Flashcard created');
});

export const listDue = asyncHandler(async (req: AuthRequest, res) => {
  const cards = await flashcardService.listDue(req.userId!, req.query.deckName as string | undefined);
  return ApiResponse.success(res, cards, 'Due flashcards fetched');
});

export const listByNote = asyncHandler(async (req: AuthRequest, res) => {
  const cards = await flashcardService.listByNote(req.params.noteId);
  return ApiResponse.success(res, cards, 'Flashcards fetched');
});

export const listDecks = asyncHandler(async (req: AuthRequest, res) => {
  const decks = await flashcardService.listDecks(req.userId!);
  return ApiResponse.success(res, decks, 'Decks fetched');
});

export const reviewCard = asyncHandler(async (req: AuthRequest, res) => {
  const card = await flashcardService.review(req.params.id, req.userId!, req.body.quality);
  return ApiResponse.success(res, card, 'Review recorded');
});

export const deleteCard = asyncHandler(async (req: AuthRequest, res) => {
  await flashcardService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Flashcard deleted');
});

export const getCounts = asyncHandler(async (req: AuthRequest, res) => {
  const counts = await flashcardService.counts(req.userId!);
  return ApiResponse.success(res, counts, 'Flashcard counts fetched');
});
