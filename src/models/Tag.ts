import { Schema, model, Document, Types } from 'mongoose';

export interface ITag extends Document {
  _id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true, lowercase: true, maxlength: 50 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    color: { type: String, default: '#C9932E' },
  },
  { timestamps: true }
);

tagSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Tag = model<ITag>('Tag', tagSchema);
