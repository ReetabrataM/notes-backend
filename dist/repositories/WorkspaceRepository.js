"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Workspace_1 = require("../models/Workspace");
class WorkspaceRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Workspace_1.Workspace);
    }
    async findForUser(userId) {
        return this.model.find({ 'members.user': userId }).sort({ name: 1 }).populate('members.user', 'name username avatarUrl').exec();
    }
}
exports.workspaceRepository = new WorkspaceRepository();
//# sourceMappingURL=WorkspaceRepository.js.map