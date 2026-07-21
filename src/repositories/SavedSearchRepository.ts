import { BaseRepository } from './BaseRepository';
import { SavedSearch, ISavedSearch } from '../models/SavedSearch';

class SavedSearchRepository extends BaseRepository<ISavedSearch> {
  constructor() {
    super(SavedSearch);
  }

  async findByOwner(owner: string, smartFoldersOnly?: boolean) {
    const filter: any = { owner };
    if (smartFoldersOnly) filter.isSmartFolder = true;
    return this.model.find(filter).sort({ name: 1 }).populate('filters.tags', 'name color').exec();
  }
}

export const savedSearchRepository = new SavedSearchRepository();
