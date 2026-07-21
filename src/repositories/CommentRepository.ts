import { BaseRepository } from './BaseRepository';
import { Comment, IComment } from '../models/Comment';

class CommentRepository extends BaseRepository<IComment> {
  constructor() {
    super(Comment);
  }

  async findByNote(noteId: string) {
    return this.model
      .find({ note: noteId })
      .sort({ createdAt: 1 })
      .populate('author', 'name username avatarUrl')
      .populate('mentions', 'name username')
      .exec();
  }
}

export const commentRepository = new CommentRepository();
