"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Note_1 = require("../models/Note");
class NoteRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Note_1.Note);
    }
    buildFilter(opts) {
        const filter = {};
        if (opts.scopeToOwner !== false)
            filter.owner = opts.owner;
        filter.isDeleted = opts.isDeleted ?? false;
        if (opts.isArchived !== undefined)
            filter.isArchived = opts.isArchived;
        else
            filter.isArchived = false;
        if (opts.isPinned !== undefined)
            filter.isPinned = opts.isPinned;
        if (opts.isFavorite !== undefined)
            filter.isFavorite = opts.isFavorite;
        if (opts.folder)
            filter.folder = opts.folder;
        if (opts.priority)
            filter.priority = opts.priority;
        if (opts.color)
            filter.color = opts.color;
        if (opts.tags && opts.tags.length)
            filter.tags = { $in: opts.tags };
        if (opts.search) {
            filter.$text = { $search: opts.search };
        }
        if (opts.dateFrom || opts.dateTo) {
            filter.createdAt = {};
            if (opts.dateFrom)
                filter.createdAt.$gte = new Date(opts.dateFrom);
            if (opts.dateTo)
                filter.createdAt.$lte = new Date(opts.dateTo);
        }
        if (opts.idsIn) {
            filter._id = { $in: opts.idsIn };
        }
        return filter;
    }
    async paginate(opts) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(100, Math.max(1, opts.limit || 20));
        const filter = this.buildFilter(opts);
        const [items, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ isPinned: -1, updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('folder', 'name color icon')
                .populate('tags', 'name color')
                .exec(),
            this.model.countDocuments(filter),
        ]);
        return {
            items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
exports.noteRepository = new NoteRepository();
//# sourceMappingURL=NoteRepository.js.map