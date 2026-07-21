import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'note_shared'
  | 'comment_added'
  | 'mention'
  | 'reminder_due'
  | 'collaborator_joined';

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedNote?: Types.ObjectId;
  relatedUser?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['note_shared', 'comment_added', 'mention', 'reminder_due', 'collaborator_joined'],
    required: true,
  },
  message: { type: String, required: true },
  relatedNote: { type: Schema.Types.ObjectId, ref: 'Note' },
  relatedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
