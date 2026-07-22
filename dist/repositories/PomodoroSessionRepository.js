"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pomodoroSessionRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const PomodoroSession_1 = require("../models/PomodoroSession");
class PomodoroSessionRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(PomodoroSession_1.PomodoroSession);
    }
    async findRecent(owner, limit = 20) {
        return this.model.find({ owner }).sort({ completedAt: -1 }).limit(limit).populate('relatedNote', 'title').exec();
    }
    async findSince(owner, since) {
        return this.model.find({ owner, completedAt: { $gte: since } }).exec();
    }
    async distinctSessionDays(owner, since) {
        const filter = { owner, type: 'focus' };
        if (since)
            filter.completedAt = { $gte: since };
        const sessions = await this.model.find(filter).select('completedAt').lean();
        const days = new Set(sessions.map((s) => s.completedAt.toISOString().slice(0, 10)));
        return Array.from(days);
    }
}
exports.pomodoroSessionRepository = new PomodoroSessionRepository();
//# sourceMappingURL=PomodoroSessionRepository.js.map