"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Exam_1 = require("../models/Exam");
class ExamRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Exam_1.Exam);
    }
    async findUpcoming(owner, limit = 10) {
        return this.model
            .find({ owner, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
            .sort({ date: 1 })
            .limit(limit)
            .populate('relatedNote', 'title')
            .exec();
    }
    async findAll(owner) {
        return this.model.find({ owner }).sort({ date: 1 }).populate('relatedNote', 'title').exec();
    }
}
exports.examRepository = new ExamRepository();
//# sourceMappingURL=ExamRepository.js.map