import { flashcardRepository } from '../repositories/FlashcardRepository';
import { flashcardReviewRepository } from '../repositories/FlashcardReviewRepository';
import { activityLogRepository } from '../repositories/ActivityLogRepository';
import { noteRepository } from '../repositories/NoteRepository';
import { aiService } from './aiService';
import { ApiError } from '../utils/apiResponse';

interface ParsedCard {
  front: string;
  back: string;
}

/**
 * Parses the "Q: ...\nA: ..." text aiService.run('flashcards', ...) produces
 * into individual front/back pairs. This is what turns flashcard generation
 * from "here's some text" into actual reviewable, spaced-repetition cards.
 */
function parseFlashcardText(text: string): ParsedCard[] {
  const cards: ParsedCard[] = [];
  const blocks = text.split(/\n\s*\n/); // blank-line separated Q/A pairs

  for (const block of blocks) {
    const qMatch = block.match(/Q:\s*(.+?)(?=\nA:|$)/is);
    const aMatch = block.match(/A:\s*(.+)/is);
    if (qMatch && aMatch) {
      const front = qMatch[1].trim();
      const back = aMatch[1].trim();
      if (front && back) cards.push({ front, back });
    }
  }

  // Fallback: if the blank-line split didn't work (model ran everything
  // together), try matching Q:/A: pairs directly across the whole text.
  if (!cards.length) {
    const pairs = text.matchAll(/Q:\s*(.+?)\s*A:\s*(.+?)(?=\s*Q:|$)/gis);
    for (const m of pairs) {
      const front = m[1].trim();
      const back = m[2].trim();
      if (front && back) cards.push({ front, back });
    }
  }

  return cards;
}

/** Standard SM-2 spaced repetition update (the algorithm Anki is built on) */
function applySM2(
  card: { easeFactor: number; interval: number; repetitions: number },
  quality: number // 0-5
) {
  let { easeFactor, interval, repetitions } = card;

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return { easeFactor, interval, repetitions, dueDate };
}

class FlashcardService {
  private async assertOwnership(id: string, owner: string) {
    const card = await flashcardRepository.findById(id);
    if (!card || card.owner.toString() !== owner) throw ApiError.notFound('Flashcard not found');
    return card;
  }

  async generateFromNote(noteId: string, owner: string, deckName?: string) {
    const note = await noteRepository.findById(noteId);
    if (!note || note.owner.toString() !== owner) throw ApiError.notFound('Note not found');
    if (!note.plainText?.trim()) throw ApiError.badRequest('This note has no content to generate flashcards from');

    const generatedText = await aiService.run('flashcards', note.plainText);
    const parsed = parseFlashcardText(generatedText);

    if (!parsed.length) {
      throw ApiError.internal('Could not parse flashcards from the AI response. Try again.');
    }

    const cards = await Promise.all(
      parsed.map((c) =>
        flashcardRepository.create({
          owner: owner as any,
          note: noteId as any,
          deckName: deckName || note.title || 'General',
          front: c.front,
          back: c.back,
        })
      )
    );

    return cards;
  }

  async createManual(owner: string, input: { front: string; back: string; deckName?: string; noteId?: string }) {
    return flashcardRepository.create({
      owner: owner as any,
      note: (input.noteId as any) || null,
      deckName: input.deckName || 'General',
      front: input.front,
      back: input.back,
    });
  }

  async listDue(owner: string, deckName?: string) {
    return flashcardRepository.findDue(owner, deckName);
  }

  async listByNote(noteId: string) {
    return flashcardRepository.findByNote(noteId);
  }

  async listDecks(owner: string) {
    const decks = await flashcardRepository.findDecks(owner);
    return decks.filter(Boolean);
  }

  async review(id: string, owner: string, quality: number) {
    const card = await this.assertOwnership(id, owner);
    const updated = applySM2(card, quality);

    await flashcardReviewRepository.create({ owner: owner as any, flashcard: id as any, quality });
    await activityLogRepository.log(owner, 'reviewed a flashcard', 'note', card.note?.toString());

    return flashcardRepository.updateById(id, {
      ...updated,
      lastReviewedAt: new Date(),
    } as any);
  }

  async remove(id: string, owner: string) {
    await this.assertOwnership(id, owner);
    return flashcardRepository.deleteById(id);
  }

  async counts(owner: string) {
    const [due, total] = await Promise.all([flashcardRepository.countDue(owner), flashcardRepository.countTotal(owner)]);
    return { due, total };
  }
}

export const flashcardService = new FlashcardService();
