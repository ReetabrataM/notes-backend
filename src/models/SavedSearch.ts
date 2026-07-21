import { Schema, model, Document, Types } from 'mongoose';

export interface ISavedSearchFilters {
  search?: string;
  tags?: Types.ObjectId[];
  tagPrefix?: string;
  folder?: Types.ObjectId | null;
  priority?: string;
  color?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
  attachmentType?: string;
}

export interface ISavedSearch extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  /** When true, this also renders as a "smart folder" in the Folders view, not just in Saved Searches */
  isSmartFolder: boolean;
  filters: ISavedSearchFilters;
  createdAt: Date;
  updatedAt: Date;
}

const savedSearchSchema = new Schema<ISavedSearch>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    icon: { type: String, default: 'search' },
    color: { type: String, default: '#4FD1C5' },
    isSmartFolder: { type: Boolean, default: false },
    filters: {
      search: { type: String, default: '' },
      tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
      tagPrefix: { type: String, default: '' },
      folder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
      priority: { type: String, default: '' },
      color: { type: String, default: '' },
      isPinned: { type: Boolean, default: undefined },
      isFavorite: { type: Boolean, default: undefined },
      isArchived: { type: Boolean, default: undefined },
      dateFrom: { type: Date, default: null },
      dateTo: { type: Date, default: null },
      hasAttachments: { type: Boolean, default: undefined },
      attachmentType: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

savedSearchSchema.index({ owner: 1, isSmartFolder: 1 });

export const SavedSearch = model<ISavedSearch>('SavedSearch', savedSearchSchema);
