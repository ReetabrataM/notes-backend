"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reminder = void 0;
const mongoose_1 = require("mongoose");
const reminderSchema = new mongoose_1.Schema({
    note: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', required: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });
reminderSchema.index({ owner: 1, dueDate: 1 });
exports.Reminder = (0, mongoose_1.model)('Reminder', reminderSchema);
//# sourceMappingURL=Reminder.js.map