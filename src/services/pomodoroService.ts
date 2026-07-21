import { pomodoroSessionRepository } from '../repositories/PomodoroSessionRepository';
import { activityLogRepository } from '../repositories/ActivityLogRepository';

export interface LogSessionInput {
  type: 'focus' | 'break';
  durationMinutes: number;
  startedAt: string;
  relatedNote?: string | null;
}

class PomodoroService {
  async logSession(owner: string, input: LogSessionInput) {
    const session = await pomodoroSessionRepository.create({
      owner: owner as any,
      type: input.type,
      durationMinutes: input.durationMinutes,
      startedAt: new Date(input.startedAt),
      completedAt: new Date(),
      relatedNote: (input.relatedNote as any) || null,
    });

    if (input.type === 'focus') {
      await activityLogRepository.log(owner, 'completed a focus session', 'note', input.relatedNote || undefined, {
        durationMinutes: input.durationMinutes,
      });
    }

    return session;
  }

  async listRecent(owner: string, limit = 20) {
    return pomodoroSessionRepository.findRecent(owner, limit);
  }

  async weeklyFocusMinutes(owner: string) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sessions = await pomodoroSessionRepository.findSince(owner, since);
    const focusSessions = sessions.filter((s) => s.type === 'focus');
    return {
      sessionCount: focusSessions.length,
      totalMinutes: focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    };
  }
}

export const pomodoroService = new PomodoroService();
