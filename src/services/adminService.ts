import { User } from '../models/User';
import { Note } from '../models/Note';
import { activityLogRepository } from '../repositories/ActivityLogRepository';
import { ApiError } from '../utils/apiResponse';

class AdminService {
  async listUsers(page = 1, limit = 20, search?: string) {
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('name username email role isSuspended lastLoginAt createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async suspendUser(userId: string, suspended: boolean) {
    const user = await User.findByIdAndUpdate(userId, { isSuspended: suspended }, { new: true });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw ApiError.notFound('User not found');
    await Note.deleteMany({ owner: userId });
    return user;
  }

  async systemStats() {
    const [totalUsers, totalNotes, suspendedUsers, activeToday, storageAgg] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments({ isDeleted: false }),
      User.countDocuments({ isSuspended: true }),
      User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Note.aggregate([{ $group: { _id: null, totalChars: { $sum: '$characterCount' } } }]),
    ]);

    return {
      totalUsers,
      totalNotes,
      suspendedUsers,
      activeToday,
      totalStorageBytesUsed: storageAgg[0]?.totalChars || 0,
    };
  }

  async recentActivity(limit = 50) {
    return activityLogRepository.findRecent(limit);
  }
}

export const adminService = new AdminService();
