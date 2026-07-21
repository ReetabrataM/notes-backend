import { Schema, model, Document, Types } from 'mongoose';

export interface IVersionHistory extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  content: string;
  plainText: string;
  createdAt: Date;
}

const versionHistorySchema = new Schema<IVersionHistory>({
  note: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  plainText: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

versionHistorySchema.index({ note: 1, createdAt: -1 });

export const VersionHistory = model<IVersionHistory>('VersionHistory', versionHistorySchema);
