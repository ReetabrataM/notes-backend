"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionService = void 0;
const VersionHistoryRepository_1 = require("../repositories/VersionHistoryRepository");
const NoteRepository_1 = require("../repositories/NoteRepository");
const apiResponse_1 = require("../utils/apiResponse");
const sharingService_1 = require("./sharingService");
class VersionService {
    async assertAccess(noteId, userId) {
        const level = await sharingService_1.sharingService.getAccessLevel(noteId, userId);
        if (!level)
            throw apiResponse_1.ApiError.notFound('Note not found');
        return level;
    }
    async list(noteId, userId) {
        await this.assertAccess(noteId, userId);
        return VersionHistoryRepository_1.versionHistoryRepository.findByNote(noteId);
    }
    async restore(noteId, versionId, userId) {
        const access = await this.assertAccess(noteId, userId);
        if (access === 'read')
            throw apiResponse_1.ApiError.forbidden('You only have read access to this note');
        const version = await VersionHistoryRepository_1.versionHistoryRepository.findById(versionId);
        if (!version || version.note.toString() !== noteId)
            throw apiResponse_1.ApiError.notFound('Version not found');
        const current = await NoteRepository_1.noteRepository.findById(noteId);
        if (current) {
            await VersionHistoryRepository_1.versionHistoryRepository.create({
                note: noteId,
                author: userId,
                title: current.title,
                content: current.content,
                plainText: current.plainText,
            });
        }
        return NoteRepository_1.noteRepository.updateById(noteId, {
            title: version.title,
            content: version.content,
            plainText: version.plainText,
        });
    }
}
exports.versionService = new VersionService();
//# sourceMappingURL=versionService.js.map