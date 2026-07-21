import { BaseRepository } from './BaseRepository';
import { VersionHistory, IVersionHistory } from '../models/VersionHistory';

class VersionHistoryRepository extends BaseRepository<IVersionHistory> {
  constructor() {
    super(VersionHistory);
  }

  async findByNote(noteId: string) {
    return this.model
      .find({ note: noteId })
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatarUrl')
      .exec();
  }
}

export const versionHistoryRepository = new VersionHistoryRepository();
