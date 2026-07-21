import { Schema, model, Document, Types } from 'mongoose';

export interface IAttachment extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  owner: Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  provider: 'local' | 'cloudinary';
  order: number;
  createdAt: Date;
}

const attachmentSchema = new Schema<IAttachment>({
  note: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  provider: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

attachmentSchema.index({ note: 1, order: 1 });

export const Attachment = model<IAttachment>('Attachment', attachmentSchema);
