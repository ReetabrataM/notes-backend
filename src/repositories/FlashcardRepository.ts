import { BaseRepository } from './BaseRepository';
import { Flashcard, IFlashcard } from '../models/Flashcard';

class FlashcardRepository extends BaseRepository<IFlashcard> {
  constructor() {
    super(Flashcard);
  }

  async findDue(owner: string, deckName?: string, limit = 20) {
    const filter: any = { owner, dueDate: { $lte: new Date() } };
    if (deckName) filter.deckName = deckName;
    return this.model.find(filter).sort({ dueDate: 1 }).limit(limit).populate('note', 'title').exec();
  }

  async findByNote(noteId: string) {
    return this.model.find({ note: noteId }).sort({ createdAt: -1 }).exec();
  }

  async findDecks(owner: string) {
    return this.model.distinct('deckName', { owner });
  }

  async countDue(owner: string) {
    return this.model.countDocuments({ owner, dueDate: { $lte: new Date() } });
  }

  async countTotal(owner: string) {
    return this.model.countDocuments({ owner });
  }
}

export const flashcardRepository = new FlashcardRepository();
