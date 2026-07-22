"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const ActivityLog_1 = require("../models/ActivityLog");
class ActivityLogRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ActivityLog_1.ActivityLog);
    }
    async log(userId, action, entityType, entityId, meta) {
        return this.model.create({ user: userId, action, entityType, entityId, meta });
    }
    async findByUser(userId, limit = 30) {
        return this.model.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).exec();
    }
    async findRecent(limit = 50) {
        return this.model.find().sort({ createdAt: -1 }).limit(limit).populate('user', 'name username').exec();
    }
}
exports.activityLogRepository = new ActivityLogRepository();
//# sourceMappingURL=ActivityLogRepository.js.map