import { Schema, model, Document, Types } from 'mongoose';

export interface IExam extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  subject: string;
  date: Date;
  color: string;
  relatedNote: Types.ObjectId | null;
  createdAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    date: { type: Date, required: true },
    color: { type: String, default: '#E5484D' },
    relatedNote: { type: Schema.Types.ObjectId, ref: 'Note', default: null },
  },
  { timestamps: true }
);

examSchema.index({ owner: 1, date: 1 });

export const Exam = model<IExam>('Exam', examSchema);
