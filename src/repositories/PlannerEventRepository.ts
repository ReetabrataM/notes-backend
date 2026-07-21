import { BaseRepository } from './BaseRepository';
import { PlannerEvent, IPlannerEvent } from '../models/PlannerEvent';

class PlannerEventRepository extends BaseRepository<IPlannerEvent> {
  constructor() {
    super(PlannerEvent);
  }

  async findInRange(owner: string, start: Date, end: Date) {
    return this.model
      .find({ owner, date: { $gte: start, $lte: end } })
      .sort({ date: 1, startTime: 1 })
      .populate('relatedNote', 'title')
      .exec();
  }

  async findUpcoming(owner: string, limit = 10) {
    return this.model
      .find({ owner, date: { $gte: new Date() }, isCompleted: false })
      .sort({ date: 1, startTime: 1 })
      .limit(limit)
      .populate('relatedNote', 'title')
      .exec();
  }
}

export const plannerEventRepository = new PlannerEventRepository();
