"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Attachment_1 = require("../models/Attachment");
class AttachmentRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Attachment_1.Attachment);
    }
    async findByNote(noteId) {
        return this.model.find({ note: noteId }).sort({ order: 1, createdAt: -1 }).exec();
    }
    async countByNote(noteId) {
        return this.model.countDocuments({ note: noteId });
    }
    async reorder(noteId, orderedIds) {
        await Promise.all(orderedIds.map((id, index) => this.model.updateOne({ _id: id, note: noteId }, { order: index })));
        return this.findByNote(noteId);
    }
}
exports.attachmentRepository = new AttachmentRepository();
//# sourceMappingURL=AttachmentRepository.js.map