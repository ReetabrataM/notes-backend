"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCounts = exports.deleteCard = exports.reviewCard = exports.listDecks = exports.listByNote = exports.listDue = exports.createManual = exports.generateFromNote = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const flashcardService_1 = require("../services/flashcardService");
exports.generateFromNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cards = await flashcardService_1.flashcardService.generateFromNote(req.params.noteId, req.userId, req.body.deckName);
    return apiResponse_1.ApiResponse.created(res, cards, 'Flashcards generated');
});
exports.createManual = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const card = await flashcardService_1.flashcardService.createManual(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, card, 'Flashcard created');
});
exports.listDue = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cards = await flashcardService_1.flashcardService.listDue(req.userId, req.query.deckName);
    return apiResponse_1.ApiResponse.success(res, cards, 'Due flashcards fetched');
});
exports.listByNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cards = await flashcardService_1.flashcardService.listByNote(req.params.noteId);
    return apiResponse_1.ApiResponse.success(res, cards, 'Flashcards fetched');
});
exports.listDecks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const decks = await flashcardService_1.flashcardService.listDecks(req.userId);
    return apiResponse_1.ApiResponse.success(res, decks, 'Decks fetched');
});
exports.reviewCard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const card = await flashcardService_1.flashcardService.review(req.params.id, req.userId, req.body.quality);
    return apiResponse_1.ApiResponse.success(res, card, 'Review recorded');
});
exports.deleteCard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await flashcardService_1.flashcardService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Flashcard deleted');
});
exports.getCounts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const counts = await flashcardService_1.flashcardService.counts(req.userId);
    return apiResponse_1.ApiResponse.success(res, counts, 'Flashcard counts fetched');
});
//# sourceMappingURL=flashcardController.js.map