"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Notification_1 = require("../models/Notification");
class NotificationRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Notification_1.Notification);
    }
    async findByUser(userId, page = 1, limit = 20) {
        const [items, total, unreadCount] = await Promise.all([
            this.model
                .find({ user: userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('relatedUser', 'name username avatarUrl')
                .populate('relatedNote', 'title')
                .exec(),
            this.model.countDocuments({ user: userId }),
            this.model.countDocuments({ user: userId, isRead: false }),
        ]);
        return { items, total, unreadCount };
    }
    async markAllRead(userId) {
        return this.model.updateMany({ user: userId, isRead: false }, { isRead: true });
    }
}
exports.notificationRepository = new NotificationRepository();
//# sourceMappingURL=NotificationRepository.js.map