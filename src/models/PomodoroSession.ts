import { Schema, model, Document, Types } from 'mongoose';

export type PomodoroSessionType = 'focus' | 'break';

export interface IPomodoroSession extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  type: PomodoroSessionType;
  durationMinutes: number;
  startedAt: Date;
  completedAt: Date;
  relatedNote: Types.ObjectId | null;
}

const pomodoroSessionSchema = new Schema<IPomodoroSession>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['focus', 'break'], default: 'focus' },
  durationMinutes: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, default: Date.now },
  relatedNote: { type: Schema.Types.ObjectId, ref: 'Note', default: null },
});

pomodoroSessionSchema.index({ owner: 1, completedAt: -1 });

export const PomodoroSession = model<IPomodoroSession>('PomodoroSession', pomodoroSessionSchema);
