import { reminderRepository } from '../repositories/ReminderRepository';
import { noteRepository } from '../repositories/NoteRepository';
import { ApiError } from '../utils/apiResponse';
import { RecurrencePattern } from '../models/Reminder';

function nextDueDate(current: Date, recurrence: RecurrencePattern): Date {
  const next = new Date(current);
  if (recurrence === 'daily') next.setDate(next.getDate() + 1);
  if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
  if (recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
  return next;
}

class ReminderService {
  private async assertOwnership(noteId: string, owner: string) {
    const note = await noteRepository.findById(noteId);
    if (!note || note.owner.toString() !== owner) throw ApiError.notFound('Note not found');
  }

  async create(owner: string, noteId: string, dueDate: string, recurrence: RecurrencePattern = 'none') {
    await this.assertOwnership(noteId, owner);
    return reminderRepository.create({ owner: owner as any, note: noteId as any, dueDate: new Date(dueDate), recurrence });
  }

  async list(owner: string, opts: { upcoming?: boolean; completed?: boolean } = {}) {
    return reminderRepository.findByOwner(owner, opts);
  }

  async complete(id: string, owner: string) {
    const reminder = await reminderRepository.findById(id);
    if (!reminder || reminder.owner.toString() !== owner) throw ApiError.notFound('Reminder not found');

    if (reminder.recurrence !== 'none') {
      // roll forward instead of marking complete permanently
      return reminderRepository.updateById(id, { dueDate: nextDueDate(reminder.dueDate, reminder.recurrence) } as any);
    }
    return reminderRepository.updateById(id, { isCompleted: true } as any);
  }

  async remove(id: string, owner: string) {
    const reminder = await reminderRepository.findById(id);
    if (!reminder || reminder.owner.toString() !== owner) throw ApiError.notFound('Reminder not found');
    return reminderRepository.deleteById(id);
  }
}

export const reminderService = new ReminderService();
