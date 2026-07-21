import { savedSearchRepository } from '../repositories/SavedSearchRepository';
import { ApiError } from '../utils/apiResponse';
import { ISavedSearchFilters } from '../models/SavedSearch';

export interface SavedSearchInput {
  name: string;
  icon?: string;
  color?: string;
  isSmartFolder?: boolean;
  filters: ISavedSearchFilters;
}

class SavedSearchService {
  private async assertOwnership(id: string, owner: string) {
    const item = await savedSearchRepository.findById(id);
    if (!item || item.owner.toString() !== owner) throw ApiError.notFound('Saved search not found');
    return item;
  }

  async list(owner: string, smartFoldersOnly?: boolean) {
    return savedSearchRepository.findByOwner(owner, smartFoldersOnly);
  }

  async create(owner: string, input: SavedSearchInput) {
    return savedSearchRepository.create({
      owner: owner as any,
      name: input.name,
      icon: input.icon || 'search',
      color: input.color || '#4FD1C5',
      isSmartFolder: input.isSmartFolder || false,
      filters: input.filters,
    });
  }

  async update(id: string, owner: string, input: Partial<SavedSearchInput>) {
    await this.assertOwnership(id, owner);
    return savedSearchRepository.updateById(id, input as any);
  }

  async remove(id: string, owner: string) {
    await this.assertOwnership(id, owner);
    return savedSearchRepository.deleteById(id);
  }
}

export const savedSearchService = new SavedSearchService();
