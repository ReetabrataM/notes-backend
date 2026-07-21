import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  entityType: 'note' | 'folder' | 'tag' | 'user' | 'auth';
  entityId?: Types.ObjectId;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entityType: { type: String, enum: ['note', 'folder', 'tag', 'user', 'auth'], required: true },
  entityId: { type: Schema.Types.ObjectId },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
