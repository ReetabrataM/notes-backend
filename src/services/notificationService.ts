import { notificationRepository } from '../repositories/NotificationRepository';
import { NotificationType } from '../models/Notification';
import { emitToUser } from '../socket';

class NotificationService {
  async create(userId: string, type: NotificationType, message: string, relatedNote?: string, relatedUser?: string) {
    const notification = await notificationRepository.create({
      user: userId as any,
      type,
      message,
      relatedNote: relatedNote as any,
      relatedUser: relatedUser as any,
    });
    emitToUser(userId, 'notification:new', notification);
    return notification;
  }

  async list(userId: string, page = 1, limit = 20) {
    return notificationRepository.findByUser(userId, page, limit);
  }

  async markRead(id: string, userId: string) {
    return notificationRepository.updateById(id, { isRead: true } as any);
  }

  async markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  }
}

export const notificationService = new NotificationService();
