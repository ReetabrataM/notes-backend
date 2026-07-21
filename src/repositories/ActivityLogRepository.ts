import { BaseRepository } from './BaseRepository';
import { ActivityLog, IActivityLog } from '../models/ActivityLog';

class ActivityLogRepository extends BaseRepository<IActivityLog> {
  constructor() {
    super(ActivityLog);
  }

  async log(userId: string, action: string, entityType: IActivityLog['entityType'], entityId?: string, meta?: Record<string, unknown>) {
    return this.model.create({ user: userId, action, entityType, entityId, meta });
  }

  async findByUser(userId: string, limit = 30) {
    return this.model.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findRecent(limit = 50) {
    return this.model.find().sort({ createdAt: -1 }).limit(limit).populate('user', 'name username').exec();
  }
}

export const activityLogRepository = new ActivityLogRepository();
