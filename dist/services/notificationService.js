"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const socket_1 = require("../socket");
class NotificationService {
    async create(userId, type, message, relatedNote, relatedUser) {
        const notification = await NotificationRepository_1.notificationRepository.create({
            user: userId,
            type,
            message,
            relatedNote: relatedNote,
            relatedUser: relatedUser,
        });
        (0, socket_1.emitToUser)(userId, 'notification:new', notification);
        return notification;
    }
    async list(userId, page = 1, limit = 20) {
        return NotificationRepository_1.notificationRepository.findByUser(userId, page, limit);
    }
    async markRead(id, userId) {
        return NotificationRepository_1.notificationRepository.updateById(id, { isRead: true });
    }
    async markAllRead(userId) {
        return NotificationRepository_1.notificationRepository.markAllRead(userId);
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notificationService.js.map