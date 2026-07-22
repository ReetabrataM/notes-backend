"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashcardService = void 0;
const FlashcardRepository_1 = require("../repositories/FlashcardRepository");
const FlashcardReviewRepository_1 = require("../repositories/FlashcardReviewRepository");
const ActivityLogRepository_1 = require("../repositories/ActivityLogRepository");
const NoteRepository_1 = require("../repositories/NoteRepository");
const aiService_1 = require("./aiService");
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Parses the "Q: ...\nA: ..." text aiService.run('flashcards', ...) produces
 * into individual front/back pairs. This is what turns flashcard generation
 * from "here's some text" into actual reviewable, spaced-repetition cards.
 */
function parseFlashcardText(text) {
    const cards = [];
    const blocks = text.split(/\n\s*\n/); // blank-line separated Q/A pairs
    for (const block of blocks) {
        const qMatch = block.match(/Q:\s*(.+?)(?=\nA:|$)/is);
        const aMatch = block.match(/A:\s*(.+)/is);
        if (qMatch && aMatch) {
            const front = qMatch[1].trim();
            const back = aMatch[1].trim();
            if (front && back)
                cards.push({ front, back });
        }
    }
    // Fallback: if the blank-line split didn't work (model ran everything
    // together), try matching Q:/A: pairs directly across the whole text.
    if (!cards.length) {
        const pairs = text.matchAll(/Q:\s*(.+?)\s*A:\s*(.+?)(?=\s*Q:|$)/gis);
        for (const m of pairs) {
            const front = m[1].trim();
            const back = m[2].trim();
            if (front && back)
                cards.push({ front, back });
        }
    }
    return cards;
}
/** Standard SM-2 spaced repetition update (the algorithm Anki is built on) */
function applySM2(card, quality // 0-5
) {
    let { easeFactor, interval, repetitions } = card;
    if (quality >= 3) {
        if (repetitions === 0)
            interval = 1;
        else if (repetitions === 1)
            interval = 6;
        else
            interval = Math.round(interval * easeFactor);
        repetitions += 1;
    }
    else {
        repetitions = 0;
        interval = 1;
    }
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);
    return { easeFactor, interval, repetitions, dueDate };
}
class FlashcardService {
    async assertOwnership(id, owner) {
        const card = await FlashcardRepository_1.flashcardRepository.findById(id);
        if (!card || card.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Flashcard not found');
        return card;
    }
    async generateFromNote(noteId, owner, deckName) {
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        if (!note || note.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Note not found');
        if (!note.plainText?.trim())
            throw apiResponse_1.ApiError.badRequest('This note has no content to generate flashcards from');
        const generatedText = await aiService_1.aiService.run('flashcards', note.plainText);
        const parsed = parseFlashcardText(generatedText);
        if (!parsed.length) {
            throw apiResponse_1.ApiError.internal('Could not parse flashcards from the AI response. Try again.');
        }
        const cards = await Promise.all(parsed.map((c) => FlashcardRepository_1.flashcardRepository.create({
            owner: owner,
            note: noteId,
            deckName: deckName || note.title || 'General',
            front: c.front,
            back: c.back,
        })));
        return cards;
    }
    async createManual(owner, input) {
        return FlashcardRepository_1.flashcardRepository.create({
            owner: owner,
            note: input.noteId || null,
            deckName: input.deckName || 'General',
            front: input.front,
            back: input.back,
        });
    }
    async listDue(owner, deckName) {
        return FlashcardRepository_1.flashcardRepository.findDue(owner, deckName);
    }
    async listByNote(noteId) {
        return FlashcardRepository_1.flashcardRepository.findByNote(noteId);
    }
    async listDecks(owner) {
        const decks = await FlashcardRepository_1.flashcardRepository.findDecks(owner);
        return decks.filter(Boolean);
    }
    async review(id, owner, quality) {
        const card = await this.assertOwnership(id, owner);
        const updated = applySM2(card, quality);
        await FlashcardReviewRepository_1.flashcardReviewRepository.create({ owner: owner, flashcard: id, quality });
        await ActivityLogRepository_1.activityLogRepository.log(owner, 'reviewed a flashcard', 'note', card.note?.toString());
        return FlashcardRepository_1.flashcardRepository.updateById(id, {
            ...updated,
            lastReviewedAt: new Date(),
        });
    }
    async remove(id, owner) {
        await this.assertOwnership(id, owner);
        return FlashcardRepository_1.flashcardRepository.deleteById(id);
    }
    async counts(owner) {
        const [due, total] = await Promise.all([FlashcardRepository_1.flashcardRepository.countDue(owner), FlashcardRepository_1.flashcardRepository.countTotal(owner)]);
        return { due, total };
    }
}
exports.flashcardService = new FlashcardService();
//# sourceMappingURL=flashcardService.js.map