"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionHistory = void 0;
const mongoose_1 = require("mongoose");
const versionHistorySchema = new mongoose_1.Schema({
    note: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    plainText: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});
versionHistorySchema.index({ note: 1, createdAt: -1 });
exports.VersionHistory = (0, mongoose_1.model)('VersionHistory', versionHistorySchema);
//# sourceMappingURL=VersionHistory.js.map