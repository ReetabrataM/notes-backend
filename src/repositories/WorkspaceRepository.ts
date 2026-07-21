import { BaseRepository } from './BaseRepository';
import { Workspace, IWorkspace } from '../models/Workspace';

class WorkspaceRepository extends BaseRepository<IWorkspace> {
  constructor() {
    super(Workspace);
  }

  async findForUser(userId: string) {
    return this.model.find({ 'members.user': userId }).sort({ name: 1 }).populate('members.user', 'name username avatarUrl').exec();
  }
}

export const workspaceRepository = new WorkspaceRepository();
