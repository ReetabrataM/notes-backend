import { Schema, model, Document, Types } from 'mongoose';

// A log of every individual review — the Flashcard document only holds the
// *current* SM-2 state, but weekly stats/streaks/accuracy need the history of
// when reviews happened and how they went, not just the latest snapshot.
export interface IFlashcardReview extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  flashcard: Types.ObjectId;
  quality: number; // 0-5, SM-2 scale
  reviewedAt: Date;
}

const flashcardReviewSchema = new Schema<IFlashcardReview>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  flashcard: { type: Schema.Types.ObjectId, ref: 'Flashcard', required: true },
  quality: { type: Number, required: true, min: 0, max: 5 },
  reviewedAt: { type: Date, default: Date.now },
});

flashcardReviewSchema.index({ owner: 1, reviewedAt: -1 });

export const FlashcardReview = model<IFlashcardReview>('FlashcardReview', flashcardReviewSchema);
