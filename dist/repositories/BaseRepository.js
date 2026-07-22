"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(id, options) {
        return this.model.findById(id, null, options).exec();
    }
    async findOne(filter, options) {
        return this.model.findOne(filter, null, options).exec();
    }
    async find(filter, options) {
        return this.model.find(filter, null, options).exec();
    }
    async updateById(id, update) {
        return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
    }
    async deleteById(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
    async count(filter) {
        return this.model.countDocuments(filter).exec();
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map