"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plannerService = void 0;
const PlannerEventRepository_1 = require("../repositories/PlannerEventRepository");
const apiResponse_1 = require("../utils/apiResponse");
class PlannerService {
    async assertOwnership(eventId, owner) {
        const event = await PlannerEventRepository_1.plannerEventRepository.findById(eventId);
        if (!event || event.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Planner event not found');
        return event;
    }
    async listRange(owner, start, end) {
        return PlannerEventRepository_1.plannerEventRepository.findInRange(owner, new Date(start), new Date(end));
    }
    async listUpcoming(owner, limit) {
        return PlannerEventRepository_1.plannerEventRepository.findUpcoming(owner, limit);
    }
    async create(owner, input) {
        return PlannerEventRepository_1.plannerEventRepository.create({
            owner: owner,
            title: input.title,
            description: input.description || '',
            type: input.type || 'task',
            date: new Date(input.date),
            startTime: input.startTime || '',
            endTime: input.endTime || '',
            color: input.color || '#C9932E',
            recurrence: input.recurrence || 'none',
            relatedNote: input.relatedNote || null,
        });
    }
    async update(eventId, owner, input) {
        await this.assertOwnership(eventId, owner);
        const update = { ...input };
        if (input.date)
            update.date = new Date(input.date);
        return PlannerEventRepository_1.plannerEventRepository.updateById(eventId, update);
    }
    /** Used for drag-and-drop rescheduling — just moves the date, nothing else */
    async reschedule(eventId, owner, newDate) {
        await this.assertOwnership(eventId, owner);
        return PlannerEventRepository_1.plannerEventRepository.updateById(eventId, { date: new Date(newDate) });
    }
    async toggleComplete(eventId, owner) {
        const event = await this.assertOwnership(eventId, owner);
        return PlannerEventRepository_1.plannerEventRepository.updateById(eventId, { isCompleted: !event.isCompleted });
    }
    async remove(eventId, owner) {
        await this.assertOwnership(eventId, owner);
        return PlannerEventRepository_1.plannerEventRepository.deleteById(eventId);
    }
}
exports.plannerService = new PlannerService();
//# sourceMappingURL=plannerService.js.map