import { BaseRepository } from './BaseRepository';
import { Notification, INotification } from '../models/Notification';

class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  async findByUser(userId: string, page = 1, limit = 20) {
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

  async markAllRead(userId: string) {
    return this.model.updateMany({ user: userId, isRead: false }, { isRead: true });
  }
}

export const notificationRepository = new NotificationRepository();
