import { BaseRepository } from './BaseRepository';
import { Folder, IFolder } from '../models/Folder';

class FolderRepository extends BaseRepository<IFolder> {
  constructor() {
    super(Folder);
  }

  async findByOwner(owner: string) {
    return this.model.find({ owner }).sort({ name: 1 }).exec();
  }

  async findPersonal(owner: string) {
    return this.model.find({ owner, workspace: null }).sort({ name: 1 }).exec();
  }

  async findByWorkspace(workspaceId: string) {
    return this.model.find({ workspace: workspaceId }).sort({ name: 1 }).populate('owner', 'name username avatarUrl').exec();
  }
}

export const folderRepository = new FolderRepository();
