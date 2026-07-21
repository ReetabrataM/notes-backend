import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  mentions: Types.ObjectId[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ note: 1, createdAt: -1 });

export const Comment = model<IComment>('Comment', commentSchema);
