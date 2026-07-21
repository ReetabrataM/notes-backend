import { Schema, model, Document, Types } from 'mongoose';

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly';

export interface IReminder extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  owner: Types.ObjectId;
  dueDate: Date;
  recurrence: RecurrencePattern;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reminderSchema.index({ owner: 1, dueDate: 1 });

export const Reminder = model<IReminder>('Reminder', reminderSchema);
