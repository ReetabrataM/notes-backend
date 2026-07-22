"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const User_1 = require("../models/User");
const Note_1 = require("../models/Note");
const ActivityLogRepository_1 = require("../repositories/ActivityLogRepository");
const apiResponse_1 = require("../utils/apiResponse");
class AdminService {
    async listUsers(page = 1, limit = 20, search) {
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            User_1.User.find(filter)
                .select('name username email role isSuspended lastLoginAt createdAt')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User_1.User.countDocuments(filter),
        ]);
        return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async suspendUser(userId, suspended) {
        const user = await User_1.User.findByIdAndUpdate(userId, { isSuspended: suspended }, { new: true });
        if (!user)
            throw apiResponse_1.ApiError.notFound('User not found');
        return user;
    }
    async deleteUser(userId) {
        const user = await User_1.User.findByIdAndDelete(userId);
        if (!user)
            throw apiResponse_1.ApiError.notFound('User not found');
        await Note_1.Note.deleteMany({ owner: userId });
        return user;
    }
    async systemStats() {
        const [totalUsers, totalNotes, suspendedUsers, activeToday, storageAgg] = await Promise.all([
            User_1.User.countDocuments(),
            Note_1.Note.countDocuments({ isDeleted: false }),
            User_1.User.countDocuments({ isSuspended: true }),
            User_1.User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            Note_1.Note.aggregate([{ $group: { _id: null, totalChars: { $sum: '$characterCount' } } }]),
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
        return ActivityLogRepository_1.activityLogRepository.findRecent(limit);
    }
}
exports.adminService = new AdminService();
//# sourceMappingURL=adminService.js.map