import { plannerEventRepository } from '../repositories/PlannerEventRepository';
import { ApiError } from '../utils/apiResponse';
import { PlannerEventType, PlannerRecurrence } from '../models/PlannerEvent';

export interface CreatePlannerEventInput {
  title: string;
  description?: string;
  type?: PlannerEventType;
  date: string;
  startTime?: string;
  endTime?: string;
  color?: string;
  recurrence?: PlannerRecurrence;
  relatedNote?: string | null;
}

class PlannerService {
  private async assertOwnership(eventId: string, owner: string) {
    const event = await plannerEventRepository.findById(eventId);
    if (!event || event.owner.toString() !== owner) throw ApiError.notFound('Planner event not found');
    return event;
  }

  async listRange(owner: string, start: string, end: string) {
    return plannerEventRepository.findInRange(owner, new Date(start), new Date(end));
  }

  async listUpcoming(owner: string, limit?: number) {
    return plannerEventRepository.findUpcoming(owner, limit);
  }

  async create(owner: string, input: CreatePlannerEventInput) {
    return plannerEventRepository.create({
      owner: owner as any,
      title: input.title,
      description: input.description || '',
      type: input.type || 'task',
      date: new Date(input.date),
      startTime: input.startTime || '',
      endTime: input.endTime || '',
      color: input.color || '#C9932E',
      recurrence: input.recurrence || 'none',
      relatedNote: (input.relatedNote as any) || null,
    });
  }

  async update(eventId: string, owner: string, input: Partial<CreatePlannerEventInput>) {
    await this.assertOwnership(eventId, owner);
    const update: any = { ...input };
    if (input.date) update.date = new Date(input.date);
    return plannerEventRepository.updateById(eventId, update);
  }

  /** Used for drag-and-drop rescheduling — just moves the date, nothing else */
  async reschedule(eventId: string, owner: string, newDate: string) {
    await this.assertOwnership(eventId, owner);
    return plannerEventRepository.updateById(eventId, { date: new Date(newDate) } as any);
  }

  async toggleComplete(eventId: string, owner: string) {
    const event = await this.assertOwnership(eventId, owner);
    return plannerEventRepository.updateById(eventId, { isCompleted: !event.isCompleted } as any);
  }

  async remove(eventId: string, owner: string) {
    await this.assertOwnership(eventId, owner);
    return plannerEventRepository.deleteById(eventId);
  }
}

export const plannerService = new PlannerService();
