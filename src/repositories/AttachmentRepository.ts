import { BaseRepository } from './BaseRepository';
import { Attachment, IAttachment } from '../models/Attachment';

class AttachmentRepository extends BaseRepository<IAttachment> {
  constructor() {
    super(Attachment);
  }

  async findByNote(noteId: string) {
    return this.model.find({ note: noteId }).sort({ order: 1, createdAt: -1 }).exec();
  }

  async countByNote(noteId: string) {
    return this.model.countDocuments({ note: noteId });
  }

  async reorder(noteId: string, orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) => this.model.updateOne({ _id: id, note: noteId }, { order: index }))
    );
    return this.findByNote(noteId);
  }
}

export const attachmentRepository = new AttachmentRepository();
