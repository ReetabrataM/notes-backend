import { Schema, model, Document, Types } from 'mongoose';

export type NotePriority = 'low' | 'medium' | 'high' | 'none';

export interface INote extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  plainText: string;
  owner: Types.ObjectId;
  folder: Types.ObjectId | null;
  tags: Types.ObjectId[];
  links: Types.ObjectId[];
  color: string;
  priority: NotePriority;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  embedding: number[];
  embeddingUpdatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200, default: 'Untitled Note' },
    content: { type: String, default: '' }, // TipTap JSON/HTML
    plainText: { type: String, default: '', index: 'text' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    links: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
    color: { type: String, default: '#FFFFFF' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'none'], default: 'none' },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    wordCount: { type: Number, default: 0 },
    characterCount: { type: Number, default: 0 },
    readingTimeMinutes: { type: Number, default: 0 },
    embedding: { type: [Number], default: [], select: false },
    embeddingUpdatedAt: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

noteSchema.index({ owner: 1, isDeleted: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ owner: 1, folder: 1 });
noteSchema.index({ title: 'text', plainText: 'text' });
noteSchema.index({ links: 1 });

noteSchema.pre('save', function (next) {
  if (this.isModified('plainText')) {
    const words = this.plainText.trim().split(/\s+/).filter(Boolean);
    this.wordCount = words.length;
    this.characterCount = this.plainText.length;
    this.readingTimeMinutes = Math.max(1, Math.ceil(words.length / 200));
  }
  next();
});

export const Note = model<INote>('Note', noteSchema);
