import { Schema, model, Document, Types } from 'mongoose';

export type ShareAccess = 'read' | 'edit';

export interface ICollaborator {
  user: Types.ObjectId;
  access: ShareAccess;
}

export interface ISharedLink extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  owner: Types.ObjectId;
  token: string;
  isPublic: boolean;
  publicAccess: ShareAccess;
  collaborators: ICollaborator[];
  createdAt: Date;
  updatedAt: Date;
}

const sharedLinkSchema = new Schema<ISharedLink>(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    isPublic: { type: Boolean, default: false },
    publicAccess: { type: String, enum: ['read', 'edit'], default: 'read' },
    collaborators: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        access: { type: String, enum: ['read', 'edit'], default: 'read' },
      },
    ],
  },
  { timestamps: true }
);

export const SharedLink = model<ISharedLink>('SharedLink', sharedLinkSchema);
