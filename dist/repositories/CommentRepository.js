"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Comment_1 = require("../models/Comment");
class CommentRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Comment_1.Comment);
    }
    async findByNote(noteId) {
        return this.model
            .find({ note: noteId })
            .sort({ createdAt: 1 })
            .populate('author', 'name username avatarUrl')
            .populate('mentions', 'name username')
            .exec();
    }
}
exports.commentRepository = new CommentRepository();
//# sourceMappingURL=CommentRepository.js.map