"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = void 0;
const CommentRepository_1 = require("../repositories/CommentRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const NoteRepository_1 = require("../repositories/NoteRepository");
const apiResponse_1 = require("../utils/apiResponse");
const sharingService_1 = require("./sharingService");
const notificationService_1 = require("./notificationService");
const socket_1 = require("../socket");
const MENTION_REGEX = /@([a-z0-9_]+)/gi;
class CommentService {
    async assertAccess(noteId, userId) {
        const level = await sharingService_1.sharingService.getAccessLevel(noteId, userId);
        if (!level)
            throw apiResponse_1.ApiError.notFound('Note not found');
        return level;
    }
    async list(noteId, userId) {
        await this.assertAccess(noteId, userId);
        return CommentRepository_1.commentRepository.findByNote(noteId);
    }
    async create(noteId, authorId, content) {
        await this.assertAccess(noteId, authorId);
        const usernames = Array.from(content.matchAll(MENTION_REGEX)).map((m) => m[1].toLowerCase());
        const mentionedUsers = usernames.length
            ? await Promise.all(usernames.map((u) => UserRepository_1.userRepository.findByUsername(u)))
            : [];
        const mentions = mentionedUsers.filter(Boolean).map((u) => u._id);
        const comment = await CommentRepository_1.commentRepository.create({
            note: noteId,
            author: authorId,
            content,
            mentions: mentions,
        });
        const populated = await CommentRepository_1.commentRepository.findById(comment._id.toString());
        (0, socket_1.emitToNote)(noteId, 'comment:new', populated);
        const note = await NoteRepository_1.noteRepository.findById(noteId);
        const author = await UserRepository_1.userRepository.findById(authorId);
        // Notify the note owner (if someone else commented)
        if (note && note.owner.toString() !== authorId) {
            await notificationService_1.notificationService.create(note.owner.toString(), 'comment_added', `${author?.name || 'Someone'} commented on "${note.title}"`, noteId, authorId);
        }
        // Notify mentioned users
        for (const mentionedId of mentions) {
            if (mentionedId.toString() !== authorId) {
                await notificationService_1.notificationService.create(mentionedId.toString(), 'mention', `${author?.name || 'Someone'} mentioned you in a comment`, noteId, authorId);
            }
        }
        return populated;
    }
    async remove(commentId, userId) {
        const comment = await CommentRepository_1.commentRepository.findById(commentId);
        if (!comment)
            throw apiResponse_1.ApiError.notFound('Comment not found');
        if (comment.author.toString() !== userId)
            throw apiResponse_1.ApiError.forbidden('You can only delete your own comments');
        return CommentRepository_1.commentRepository.deleteById(commentId);
    }
}
exports.commentService = new CommentService();
//# sourceMappingURL=commentService.js.map