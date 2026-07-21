import { BaseRepository } from './BaseRepository';
import { Reminder, IReminder } from '../models/Reminder';

class ReminderRepository extends BaseRepository<IReminder> {
  constructor() {
    super(Reminder);
  }

  async findByOwner(owner: string, opts: { upcoming?: boolean; completed?: boolean } = {}) {
    const filter: any = { owner };
    if (opts.completed !== undefined) filter.isCompleted = opts.completed;
    if (opts.upcoming) filter.dueDate = { $gte: new Date() };
    return this.model.find(filter).sort({ dueDate: 1 }).populate('note', 'title').exec();
  }

  async findDue(before: Date) {
    return this.model.find({ dueDate: { $lte: before }, isCompleted: false }).populate('note owner');
  }
}

export const reminderRepository = new ReminderRepository();
