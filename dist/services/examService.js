"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examService = void 0;
const ExamRepository_1 = require("../repositories/ExamRepository");
const apiResponse_1 = require("../utils/apiResponse");
class ExamService {
    async assertOwnership(id, owner) {
        const exam = await ExamRepository_1.examRepository.findById(id);
        if (!exam || exam.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Exam not found');
        return exam;
    }
    async create(owner, input) {
        return ExamRepository_1.examRepository.create({
            owner: owner,
            subject: input.subject,
            date: new Date(input.date),
            color: input.color || '#E5484D',
            relatedNote: input.relatedNote || null,
        });
    }
    async listUpcoming(owner) {
        return ExamRepository_1.examRepository.findUpcoming(owner);
    }
    async listAll(owner) {
        return ExamRepository_1.examRepository.findAll(owner);
    }
    async update(id, owner, input) {
        await this.assertOwnership(id, owner);
        const update = { ...input };
        if (input.date)
            update.date = new Date(input.date);
        return ExamRepository_1.examRepository.updateById(id, update);
    }
    async remove(id, owner) {
        await this.assertOwnership(id, owner);
        return ExamRepository_1.examRepository.deleteById(id);
    }
}
exports.examService = new ExamService();
//# sourceMappingURL=examService.js.map