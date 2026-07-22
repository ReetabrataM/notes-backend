"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Session_1 = require("../models/Session");
class SessionRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Session_1.Session);
    }
    async deleteAllForUser(userId) {
        return this.model.deleteMany({ user: userId }).exec();
    }
    async deleteByHash(userId, refreshTokenHash) {
        return this.model.deleteOne({ user: userId, refreshTokenHash }).exec();
    }
    async findByHash(userId, refreshTokenHash) {
        return this.model.findOne({ user: userId, refreshTokenHash }).exec();
    }
}
exports.sessionRepository = new SessionRepository();
//# sourceMappingURL=SessionRepository.js.map