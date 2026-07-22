"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const User_1 = require("../models/User");
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(User_1.User);
    }
    async findByEmail(email, withPassword = false) {
        const query = this.model.findOne({ email: email.toLowerCase() });
        if (withPassword)
            query.select('+password');
        return query.exec();
    }
    async findByUsername(username) {
        return this.model.findOne({ username: username.toLowerCase() }).exec();
    }
    async findByEmailOrUsername(identifier, withPassword = false) {
        const query = this.model.findOne({
            $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
        });
        if (withPassword)
            query.select('+password');
        return query.exec();
    }
}
exports.userRepository = new UserRepository();
//# sourceMappingURL=UserRepository.js.map