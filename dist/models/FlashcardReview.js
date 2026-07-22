"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardReview = void 0;
const mongoose_1 = require("mongoose");
const flashcardReviewSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    flashcard: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Flashcard', required: true },
    quality: { type: Number, required: true, min: 0, max: 5 },
    reviewedAt: { type: Date, default: Date.now },
});
flashcardReviewSchema.index({ owner: 1, reviewedAt: -1 });
exports.FlashcardReview = (0, mongoose_1.model)('FlashcardReview', flashcardReviewSchema);
//# sourceMappingURL=FlashcardReview.js.map