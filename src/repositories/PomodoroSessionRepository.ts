import { BaseRepository } from './BaseRepository';
import { PomodoroSession, IPomodoroSession } from '../models/PomodoroSession';

class PomodoroSessionRepository extends BaseRepository<IPomodoroSession> {
  constructor() {
    super(PomodoroSession);
  }

  async findRecent(owner: string, limit = 20) {
    return this.model.find({ owner }).sort({ completedAt: -1 }).limit(limit).populate('relatedNote', 'title').exec();
  }

  async findSince(owner: string, since: Date) {
    return this.model.find({ owner, completedAt: { $gte: since } }).exec();
  }

  async distinctSessionDays(owner: string, since?: Date): Promise<string[]> {
    const filter: any = { owner, type: 'focus' };
    if (since) filter.completedAt = { $gte: since };
    const sessions = await this.model.find(filter).select('completedAt').lean();
    const days = new Set(sessions.map((s) => s.completedAt.toISOString().slice(0, 10)));
    return Array.from(days);
  }
}

export const pomodoroSessionRepository = new PomodoroSessionRepository();
