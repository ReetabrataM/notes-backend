import { examRepository } from '../repositories/ExamRepository';
import { ApiError } from '../utils/apiResponse';

export interface ExamInput {
  subject: string;
  date: string;
  color?: string;
  relatedNote?: string | null;
}

class ExamService {
  private async assertOwnership(id: string, owner: string) {
    const exam = await examRepository.findById(id);
    if (!exam || exam.owner.toString() !== owner) throw ApiError.notFound('Exam not found');
    return exam;
  }

  async create(owner: string, input: ExamInput) {
    return examRepository.create({
      owner: owner as any,
      subject: input.subject,
      date: new Date(input.date),
      color: input.color || '#E5484D',
      relatedNote: (input.relatedNote as any) || null,
    });
  }

  async listUpcoming(owner: string) {
    return examRepository.findUpcoming(owner);
  }

  async listAll(owner: string) {
    return examRepository.findAll(owner);
  }

  async update(id: string, owner: string, input: Partial<ExamInput>) {
    await this.assertOwnership(id, owner);
    const update: any = { ...input };
    if (input.date) update.date = new Date(input.date);
    return examRepository.updateById(id, update);
  }

  async remove(id: string, owner: string) {
    await this.assertOwnership(id, owner);
    return examRepository.deleteById(id);
  }
}

export const examService = new ExamService();
