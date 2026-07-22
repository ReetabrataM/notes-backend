"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Reminder_1 = require("../models/Reminder");
class ReminderRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Reminder_1.Reminder);
    }
    async findByOwner(owner, opts = {}) {
        const filter = { owner };
        if (opts.completed !== undefined)
            filter.isCompleted = opts.completed;
        if (opts.upcoming)
            filter.dueDate = { $gte: new Date() };
        return this.model.find(filter).sort({ dueDate: 1 }).populate('note', 'title').exec();
    }
    async findDue(before) {
        return this.model.find({ dueDate: { $lte: before }, isCompleted: false }).populate('note owner');
    }
}
exports.reminderRepository = new ReminderRepository();
//# sourceMappingURL=ReminderRepository.js.map