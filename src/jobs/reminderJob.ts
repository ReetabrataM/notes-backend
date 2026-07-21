import { reminderRepository } from '../repositories/ReminderRepository';
import { notificationService } from '../services/notificationService';
import { sendMail, reminderEmailHtml } from '../emails/mailer';
import { logger } from '../utils/logger';

const CHECK_INTERVAL_MS = 60 * 1000; // check every minute

export function startReminderJob() {
  setInterval(async () => {
    try {
      const dueReminders = await reminderRepository.findDue(new Date());
      for (const reminder of dueReminders as any[]) {
        const note = reminder.note as any;
        const owner = reminder.owner as any;
        if (!note || !owner) continue;

        await notificationService.create(
          owner._id.toString(),
          'reminder_due',
          `Reminder: "${note.title || 'Untitled Note'}" is due`,
          note._id.toString()
        );

        await sendMail({
          to: owner.email,
          subject: `Reminder: ${note.title || 'Untitled Note'}`,
          html: reminderEmailHtml(owner.name, note.title || 'Untitled Note'),
        });

        if (reminder.recurrence === 'none') {
          reminder.isCompleted = true;
          await reminder.save();
        } else {
          const next = new Date(reminder.dueDate);
          if (reminder.recurrence === 'daily') next.setDate(next.getDate() + 1);
          if (reminder.recurrence === 'weekly') next.setDate(next.getDate() + 7);
          if (reminder.recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
          reminder.dueDate = next;
          await reminder.save();
        }
      }
    } catch (error) {
      logger.error('Reminder job failed', { error });
    }
  }, CHECK_INTERVAL_MS);
}
