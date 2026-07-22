"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderJob = startReminderJob;
const ReminderRepository_1 = require("../repositories/ReminderRepository");
const notificationService_1 = require("../services/notificationService");
const logger_1 = require("../utils/logger");
const CHECK_INTERVAL_MS = 60 * 1000; // check every minute
function startReminderJob() {
    setInterval(async () => {
        try {
            const dueReminders = await ReminderRepository_1.reminderRepository.findDue(new Date());
            for (const reminder of dueReminders) {
                const note = reminder.note;
                const owner = reminder.owner;
                if (!note || !owner)
                    continue;
                await notificationService_1.notificationService.create(owner._id.toString(), 'reminder_due', `Reminder: "${note.title || 'Untitled Note'}" is due`, note._id.toString());
                if (reminder.recurrence === 'none') {
                    reminder.isCompleted = true;
                    await reminder.save();
                }
                else {
                    const next = new Date(reminder.dueDate);
                    if (reminder.recurrence === 'daily')
                        next.setDate(next.getDate() + 1);
                    if (reminder.recurrence === 'weekly')
                        next.setDate(next.getDate() + 7);
                    if (reminder.recurrence === 'monthly')
                        next.setMonth(next.getMonth() + 1);
                    reminder.dueDate = next;
                    await reminder.save();
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Reminder job failed', { error });
        }
    }, CHECK_INTERVAL_MS);
}
//# sourceMappingURL=reminderJob.js.map