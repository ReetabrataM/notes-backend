import { Schema, model, Document, Types } from 'mongoose';

export interface ISession extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  refreshTokenHash: string;
  userAgent: string;
  ip: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  refreshTokenHash: { type: String, required: true },
  userAgent: { type: String, default: '' },
  ip: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

sessionSchema.index({ user: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISession>('Session', sessionSchema);
