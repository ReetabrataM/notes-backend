"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedLinkRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const SharedLink_1 = require("../models/SharedLink");
class SharedLinkRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(SharedLink_1.SharedLink);
    }
    async findByNote(noteId) {
        return this.model.findOne({ note: noteId }).populate('collaborators.user', 'name username avatarUrl email').exec();
    }
    async findByToken(token) {
        return this.model.findOne({ token }).populate('note').populate('owner', 'name username avatarUrl').exec();
    }
}
exports.sharedLinkRepository = new SharedLinkRepository();
//# sourceMappingURL=SharedLinkRepository.js.map