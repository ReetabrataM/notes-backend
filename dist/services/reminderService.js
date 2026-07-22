"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderService = void 0;
const ReminderRepository_1 = require("../repositories/ReminderRepository");
const NoteRepository_1 = require("../repositories/NoteRepository");
const apiResponse_1 = require("../utils/apiResponse");
function nextDueDate(current, recurrence) {
    const next = new Date(current);
    if (recurrence === 'daily')
        next.setDate(next.getDate() + 1);
    if (recurrence === 'weekly')
        next.setDate(next.getDate() + 7);
    if (recurrence === 'monthly')
        next.setMonth(next.getMonth() + 1);
    return next;
}
class ReminderService {
    async assertOwnership(noteId, owner) {
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        if (!note || note.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Note not found');
    }
    async create(owner, noteId, dueDate, recurrence = 'none') {
        await this.assertOwnership(noteId, owner);
        return ReminderRepository_1.reminderRepository.create({ owner: owner, note: noteId, dueDate: new Date(dueDate), recurrence });
    }
    async list(owner, opts = {}) {
        return ReminderRepository_1.reminderRepository.findByOwner(owner, opts);
    }
    async complete(id, owner) {
        const reminder = await ReminderRepository_1.reminderRepository.findById(id);
        if (!reminder || reminder.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Reminder not found');
        if (reminder.recurrence !== 'none') {
            // roll forward instead of marking complete permanently
            return ReminderRepository_1.reminderRepository.updateById(id, { dueDate: nextDueDate(reminder.dueDate, reminder.recurrence) });
        }
        return ReminderRepository_1.reminderRepository.updateById(id, { isCompleted: true });
    }
    async remove(id, owner) {
        const reminder = await ReminderRepository_1.reminderRepository.findById(id);
        if (!reminder || reminder.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Reminder not found');
        return ReminderRepository_1.reminderRepository.deleteById(id);
    }
}
exports.reminderService = new ReminderService();
//# sourceMappingURL=reminderService.js.map