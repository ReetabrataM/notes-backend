import { Schema, model, Document, Types } from 'mongoose';

export type PlannerEventType = 'study' | 'task' | 'reminder';
export type PlannerRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface IPlannerEvent extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  description: string;
  type: PlannerEventType;
  date: Date; // calendar day this event belongs to (midnight, local-agnostic)
  startTime: string; // "HH:mm", optional for all-day items
  endTime: string;
  color: string;
  recurrence: PlannerRecurrence;
  isCompleted: boolean;
  relatedNote: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const plannerEventSchema = new Schema<IPlannerEvent>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    type: { type: String, enum: ['study', 'task', 'reminder'], default: 'task' },
    date: { type: Date, required: true },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    color: { type: String, default: '#C9932E' },
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    isCompleted: { type: Boolean, default: false },
    relatedNote: { type: Schema.Types.ObjectId, ref: 'Note', default: null },
  },
  { timestamps: true }
);

plannerEventSchema.index({ owner: 1, date: 1 });

export const PlannerEvent = model<IPlannerEvent>('PlannerEvent', plannerEventSchema);
