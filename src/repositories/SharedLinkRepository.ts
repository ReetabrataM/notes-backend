import { BaseRepository } from './BaseRepository';
import { SharedLink, ISharedLink } from '../models/SharedLink';

class SharedLinkRepository extends BaseRepository<ISharedLink> {
  constructor() {
    super(SharedLink);
  }

  async findByNote(noteId: string) {
    return this.model.findOne({ note: noteId }).populate('collaborators.user', 'name username avatarUrl email').exec();
  }

  async findByToken(token: string) {
    return this.model.findOne({ token }).populate('note').populate('owner', 'name username avatarUrl').exec();
  }
}

export const sharedLinkRepository = new SharedLinkRepository();
