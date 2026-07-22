"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionHistoryRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const VersionHistory_1 = require("../models/VersionHistory");
class VersionHistoryRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(VersionHistory_1.VersionHistory);
    }
    async findByNote(noteId) {
        return this.model
            .find({ note: noteId })
            .sort({ createdAt: -1 })
            .populate('author', 'name username avatarUrl')
            .exec();
    }
}
exports.versionHistoryRepository = new VersionHistoryRepository();
//# sourceMappingURL=VersionHistoryRepository.js.map