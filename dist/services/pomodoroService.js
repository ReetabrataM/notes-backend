"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pomodoroService = void 0;
const PomodoroSessionRepository_1 = require("../repositories/PomodoroSessionRepository");
const ActivityLogRepository_1 = require("../repositories/ActivityLogRepository");
class PomodoroService {
    async logSession(owner, input) {
        const session = await PomodoroSessionRepository_1.pomodoroSessionRepository.create({
            owner: owner,
            type: input.type,
            durationMinutes: input.durationMinutes,
            startedAt: new Date(input.startedAt),
            completedAt: new Date(),
            relatedNote: input.relatedNote || null,
        });
        if (input.type === 'focus') {
            await ActivityLogRepository_1.activityLogRepository.log(owner, 'completed a focus session', 'note', input.relatedNote || undefined, {
                durationMinutes: input.durationMinutes,
            });
        }
        return session;
    }
    async listRecent(owner, limit = 20) {
        return PomodoroSessionRepository_1.pomodoroSessionRepository.findRecent(owner, limit);
    }
    async weeklyFocusMinutes(owner) {
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const sessions = await PomodoroSessionRepository_1.pomodoroSessionRepository.findSince(owner, since);
        const focusSessions = sessions.filter((s) => s.type === 'focus');
        return {
            sessionCount: focusSessions.length,
            totalMinutes: focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
        };
    }
}
exports.pomodoroService = new PomodoroService();
//# sourceMappingURL=pomodoroService.js.map