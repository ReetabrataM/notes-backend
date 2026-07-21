import { Schema, model, Document, Types } from 'mongoose';

export interface IFolder extends Document {
  _id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  parent: Types.ObjectId | null;
  workspace: Types.ObjectId | null;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null },
    icon: { type: String, default: 'folder' },
    color: { type: String, default: '#8B909B' },
  },
  { timestamps: true }
);

folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ workspace: 1 });

export const Folder = model<IFolder>('Folder', folderSchema);
