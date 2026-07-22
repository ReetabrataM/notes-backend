"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerEvent = void 0;
const mongoose_1 = require("mongoose");
const plannerEventSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    type: { type: String, enum: ['study', 'task', 'reminder'], default: 'task' },
    date: { type: Date, required: true },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    color: { type: String, default: '#C9932E' },
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    isCompleted: { type: Boolean, default: false },
    relatedNote: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', default: null },
}, { timestamps: true });
plannerEventSchema.index({ owner: 1, date: 1 });
exports.PlannerEvent = (0, mongoose_1.model)('PlannerEvent', plannerEventSchema);
//# sourceMappingURL=PlannerEvent.js.map