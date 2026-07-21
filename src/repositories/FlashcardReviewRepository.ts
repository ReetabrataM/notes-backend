import { BaseRepository } from './BaseRepository';
import { FlashcardReview, IFlashcardReview } from '../models/FlashcardReview';

class FlashcardReviewRepository extends BaseRepository<IFlashcardReview> {
  constructor() {
    super(FlashcardReview);
  }

  async findSince(owner: string, since: Date) {
    return this.model.find({ owner, reviewedAt: { $gte: since } }).exec();
  }

  async distinctReviewDays(owner: string, since?: Date): Promise<string[]> {
    const filter: any = { owner };
    if (since) filter.reviewedAt = { $gte: since };
    const reviews = await this.model.find(filter).select('reviewedAt').lean();
    const days = new Set(reviews.map((r) => r.reviewedAt.toISOString().slice(0, 10)));
    return Array.from(days);
  }
}

export const flashcardReviewRepository = new FlashcardReviewRepository();
