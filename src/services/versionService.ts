import { versionHistoryRepository } from '../repositories/VersionHistoryRepository';
import { noteRepository } from '../repositories/NoteRepository';
import { ApiError } from '../utils/apiResponse';
import { sharingService } from './sharingService';

class VersionService {
  private async assertAccess(noteId: string, userId: string) {
    const level = await sharingService.getAccessLevel(noteId, userId);
    if (!level) throw ApiError.notFound('Note not found');
    return level;
  }

  async list(noteId: string, userId: string) {
    await this.assertAccess(noteId, userId);
    return versionHistoryRepository.findByNote(noteId);
  }

  async restore(noteId: string, versionId: string, userId: string) {
    const access = await this.assertAccess(noteId, userId);
    if (access === 'read') throw ApiError.forbidden('You only have read access to this note');

    const version = await versionHistoryRepository.findById(versionId);
    if (!version || version.note.toString() !== noteId) throw ApiError.notFound('Version not found');

    const current = await noteRepository.findById(noteId);
    if (current) {
      await versionHistoryRepository.create({
        note: noteId as any,
        author: userId as any,
        title: current.title,
        content: current.content,
        plainText: current.plainText,
      });
    }

    return noteRepository.updateById(noteId, {
      title: version.title,
      content: version.content,
      plainText: version.plainText,
    } as any);
  }
}

export const versionService = new VersionService();
