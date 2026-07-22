"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    note: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    mentions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    resolved: { type: Boolean, default: false },
}, { timestamps: true });
commentSchema.index({ note: 1, createdAt: -1 });
exports.Comment = (0, mongoose_1.model)('Comment', commentSchema);
//# sourceMappingURL=Comment.js.map