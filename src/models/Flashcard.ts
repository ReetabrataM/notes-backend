import { Schema, model, Document, Types } from 'mongoose';

export interface IFlashcard extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  note: Types.ObjectId | null;
  deckName: string;
  front: string;
  back: string;
  // SM-2 spaced repetition state (the same algorithm Anki is built on)
  easeFactor: number;
  interval: number; // days until next due
  repetitions: number;
  dueDate: Date;
  lastReviewedAt: Date | null;
  createdAt: Date;
}

const flashcardSchema = new Schema<IFlashcard>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: Schema.Types.ObjectId, ref: 'Note', default: null },
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

export const Flashcard = model<IFlashcard>('Flashcard', flashcardSchema);
