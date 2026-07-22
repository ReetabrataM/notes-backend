"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PomodoroSession = void 0;
const mongoose_1 = require("mongoose");
const pomodoroSessionSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['focus', 'break'], default: 'focus' },
    durationMinutes: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: Date.now },
    relatedNote: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', default: null },
});
pomodoroSessionSchema.index({ owner: 1, completedAt: -1 });
exports.PomodoroSession = (0, mongoose_1.model)('PomodoroSession', pomodoroSessionSchema);
//# sourceMappingURL=PomodoroSession.js.map