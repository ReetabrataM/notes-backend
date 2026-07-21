import { commentRepository } from '../repositories/CommentRepository';
import { userRepository } from '../repositories/UserRepository';
import { noteRepository } from '../repositories/NoteRepository';
import { ApiError } from '../utils/apiResponse';
import { sharingService } from './sharingService';
import { notificationService } from './notificationService';
import { emitToNote } from '../socket';

const MENTION_REGEX = /@([a-z0-9_]+)/gi;

class CommentService {
  private async assertAccess(noteId: string, userId: string) {
    const level = await sharingService.getAccessLevel(noteId, userId);
    if (!level) throw ApiError.notFound('Note not found');
    return level;
  }

  async list(noteId: string, userId: string) {
    await this.assertAccess(noteId, userId);
    return commentRepository.findByNote(noteId);
  }

  async create(noteId: string, authorId: string, content: string) {
    await this.assertAccess(noteId, authorId);

    const usernames = Array.from(content.matchAll(MENTION_REGEX)).map((m) => m[1].toLowerCase());
    const mentionedUsers = usernames.length
      ? await Promise.all(usernames.map((u) => userRepository.findByUsername(u)))
      : [];
    const mentions = mentionedUsers.filter(Boolean).map((u) => u!._id);

    const comment = await commentRepository.create({
      note: noteId as any,
      author: authorId as any,
      content,
      mentions: mentions as any,
    });

    const populated = await commentRepository.findById(comment._id.toString());
    emitToNote(noteId, 'comment:new', populated);

    const note = await noteRepository.findById(noteId);
    const author = await userRepository.findById(authorId);

    // Notify the note owner (if someone else commented)
    if (note && note.owner.toString() !== authorId) {
      await notificationService.create(
        note.owner.toString(),
        'comment_added',
        `${author?.name || 'Someone'} commented on "${note.title}"`,
        noteId,
        authorId
      );
    }

    // Notify mentioned users
    for (const mentionedId of mentions) {
      if (mentionedId.toString() !== authorId) {
        await notificationService.create(
          mentionedId.toString(),
          'mention',
          `${author?.name || 'Someone'} mentioned you in a comment`,
          noteId,
          authorId
        );
      }
    }

    return populated;
  }

  async remove(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) throw ApiError.notFound('Comment not found');
    if (comment.author.toString() !== userId) throw ApiError.forbidden('You can only delete your own comments');
    return commentRepository.deleteById(commentId);
  }
}

export const commentService = new CommentService();
