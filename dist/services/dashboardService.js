"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const Note_1 = require("../models/Note");
const mongoose_1 = require("mongoose");
class DashboardService {
    async getStats(owner) {
        const ownerId = new mongoose_1.Types.ObjectId(owner);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [total, createdToday, createdThisWeek, createdThisMonth, pinned, archived, deleted, favorite, tagAgg, recentNotes,] = await Promise.all([
            Note_1.Note.countDocuments({ owner: ownerId, isDeleted: false }),
            Note_1.Note.countDocuments({ owner: ownerId, isDeleted: false, createdAt: { $gte: startOfToday } }),
            Note_1.Note.countDocuments({ owner: ownerId, isDeleted: false, createdAt: { $gte: startOfWeek } }),
            Note_1.Note.countDocuments({ owner: ownerId, isDeleted: false, createdAt: { $gte: startOfMonth } }),
            Note_1.Note.countDocuments({ owner: ownerId, isDeleted: false, isPinned: true }),
            Note_1.Note.countDocuments({ owner: ownerId, isArchived: true }),
            Note_1.Note.countDocuments({ owner: ownerId, isDeleted: true }),
            Note_1.Note.countDocuments({ owner: ownerId, isDeleted: false, isFavorite: true }),
            Note_1.Note.aggregate([
                { $match: { owner: ownerId, isDeleted: false } },
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $lookup: { from: 'tags', localField: '_id', foreignField: '_id', as: 'tag' } },
                { $unwind: '$tag' },
                { $project: { _id: 0, name: '$tag.name', color: '$tag.color', count: 1 } },
            ]),
            Note_1.Note.find({ owner: ownerId, isDeleted: false })
                .sort({ updatedAt: -1 })
                .limit(6)
                .select('title updatedAt isPinned color'),
        ]);
        // approximate storage: character count as bytes proxy (phase 1, no attachments yet)
        const storageAgg = await Note_1.Note.aggregate([
            { $match: { owner: ownerId, isDeleted: false } },
            { $group: { _id: null, totalChars: { $sum: '$characterCount' } } },
        ]);
        const storageBytesUsed = storageAgg[0]?.totalChars || 0;
        return {
            totalNotes: total,
            notesCreatedToday: createdToday,
            weeklyNotes: createdThisWeek,
            monthlyNotes: createdThisMonth,
            pinnedNotes: pinned,
            archivedNotes: archived,
            deletedNotes: deleted,
            favoriteNotes: favorite,
            storageBytesUsed,
            mostUsedTags: tagAgg,
            recentNotes,
        };
    }
}
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboardService.js.map