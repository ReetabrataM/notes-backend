"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plannerEventRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const PlannerEvent_1 = require("../models/PlannerEvent");
class PlannerEventRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(PlannerEvent_1.PlannerEvent);
    }
    async findInRange(owner, start, end) {
        return this.model
            .find({ owner, date: { $gte: start, $lte: end } })
            .sort({ date: 1, startTime: 1 })
            .populate('relatedNote', 'title')
            .exec();
    }
    async findUpcoming(owner, limit = 10) {
        return this.model
            .find({ owner, date: { $gte: new Date() }, isCompleted: false })
            .sort({ date: 1, startTime: 1 })
            .limit(limit)
            .populate('relatedNote', 'title')
            .exec();
    }
}
exports.plannerEventRepository = new PlannerEventRepository();
//# sourceMappingURL=PlannerEventRepository.js.map