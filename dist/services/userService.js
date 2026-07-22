"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const apiResponse_1 = require("../utils/apiResponse");
class UserService {
    async getProfile(userId) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user)
            throw apiResponse_1.ApiError.notFound('User not found');
        return user;
    }
    async updateProfile(userId, input) {
        const user = await UserRepository_1.userRepository.updateById(userId, input);
        if (!user)
            throw apiResponse_1.ApiError.notFound('User not found');
        return user;
    }
}
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map