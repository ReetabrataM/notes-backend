"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flashcard = void 0;
const mongoose_1 = require("mongoose");
const flashcardSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', default: null },
    deckName: { type: String, default: 'General', trim: true, maxlength: 100 },
    front: { type: String, required: true },
    back: { type: String, required: true },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
    repetitions: { type: Number, default: 0 },
    dueDate: { type: Date, default: Date.now },
    lastReviewedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
});
flashcardSchema.index({ owner: 1, dueDate: 1 });
flashcardSchema.index({ owner: 1, note: 1 });
flashcardSchema.index({ owner: 1, deckName: 1 });
exports.Flashcard = (0, mongoose_1.model)('Flashcard', flashcardSchema);
//# sourceMappingURL=Flashcard.js.map