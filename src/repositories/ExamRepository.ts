import { BaseRepository } from './BaseRepository';
import { Exam, IExam } from '../models/Exam';

class ExamRepository extends BaseRepository<IExam> {
  constructor() {
    super(Exam);
  }

  async findUpcoming(owner: string, limit = 10) {
    return this.model
      .find({ owner, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
      .sort({ date: 1 })
      .limit(limit)
      .populate('relatedNote', 'title')
      .exec();
  }

  async findAll(owner: string) {
    return this.model.find({ owner }).sort({ date: 1 }).populate('relatedNote', 'title').exec();
  }
}

export const examRepository = new ExamRepository();
