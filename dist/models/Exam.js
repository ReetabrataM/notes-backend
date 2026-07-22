"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exam = void 0;
const mongoose_1 = require("mongoose");
const examSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    date: { type: Date, required: true },
    color: { type: String, default: '#E5484D' },
    relatedNote: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', default: null },
}, { timestamps: true });
examSchema.index({ owner: 1, date: 1 });
exports.Exam = (0, mongoose_1.model)('Exam', examSchema);
//# sourceMappingURL=Exam.js.map