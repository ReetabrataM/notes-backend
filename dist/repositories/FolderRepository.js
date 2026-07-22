"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.folderRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Folder_1 = require("../models/Folder");
class FolderRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Folder_1.Folder);
    }
    async findByOwner(owner) {
        return this.model.find({ owner }).sort({ name: 1 }).exec();
    }
    async findPersonal(owner) {
        return this.model.find({ owner, workspace: null }).sort({ name: 1 }).exec();
    }
    async findByWorkspace(workspaceId) {
        return this.model.find({ workspace: workspaceId }).sort({ name: 1 }).populate('owner', 'name username avatarUrl').exec();
    }
}
exports.folderRepository = new FolderRepository();
//# sourceMappingURL=FolderRepository.js.map