import { Schema, model, Document, Types } from 'mongoose';

export type WorkspaceRole = 'admin' | 'editor' | 'viewer';

export interface IWorkspaceMember {
  user: Types.ObjectId;
  role: WorkspaceRole;
}

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  members: IWorkspaceMember[];
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
      },
    ],
    color: { type: String, default: '#4FD1C5' },
    icon: { type: String, default: 'users' },
  },
  { timestamps: true }
);

workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

export const Workspace = model<IWorkspace>('Workspace', workspaceSchema);
