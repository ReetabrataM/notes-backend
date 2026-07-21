import { BaseRepository } from './BaseRepository';
import { Session, ISession } from '../models/Session';

class SessionRepository extends BaseRepository<ISession> {
  constructor() {
    super(Session);
  }

  async deleteAllForUser(userId: string) {
    return this.model.deleteMany({ user: userId }).exec();
  }

  async deleteByHash(userId: string, refreshTokenHash: string) {
    return this.model.deleteOne({ user: userId, refreshTokenHash }).exec();
  }

  async findByHash(userId: string, refreshTokenHash: string) {
    return this.model.findOne({ user: userId, refreshTokenHash }).exec();
  }
}

export const sessionRepository = new SessionRepository();
