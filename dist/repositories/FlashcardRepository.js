"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashcardRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Flashcard_1 = require("../models/Flashcard");
class FlashcardRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Flashcard_1.Flashcard);
    }
    async findDue(owner, deckName, limit = 20) {
        const filter = { owner, dueDate: { $lte: new Date() } };
        if (deckName)
            filter.deckName = deckName;
        return this.model.find(filter).sort({ dueDate: 1 }).limit(limit).populate('note', 'title').exec();
    }
    async findByNote(noteId) {
        return this.model.find({ note: noteId }).sort({ createdAt: -1 }).exec();
    }
    async findDecks(owner) {
        return this.model.distinct('deckName', { owner });
    }
    async countDue(owner) {
        return this.model.countDocuments({ owner, dueDate: { $lte: new Date() } });
    }
    async countTotal(owner) {
        return this.model.countDocuments({ owner });
    }
}
exports.flashcardRepository = new FlashcardRepository();
//# sourceMappingURL=FlashcardRepository.js.map