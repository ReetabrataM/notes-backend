"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = void 0;
const mongoose_1 = require("mongoose");
const activityLogSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['note', 'folder', 'tag', 'user', 'auth'], required: true },
    entityId: { type: mongoose_1.Schema.Types.ObjectId },
    meta: { type: mongoose_1.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
});
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
exports.ActivityLog = (0, mongoose_1.model)('ActivityLog', activityLogSchema);
//# sourceMappingURL=ActivityLog.js.map