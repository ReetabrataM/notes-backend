"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savedSearchService = void 0;
const SavedSearchRepository_1 = require("../repositories/SavedSearchRepository");
const apiResponse_1 = require("../utils/apiResponse");
class SavedSearchService {
    async assertOwnership(id, owner) {
        const item = await SavedSearchRepository_1.savedSearchRepository.findById(id);
        if (!item || item.owner.toString() !== owner)
            throw apiResponse_1.ApiError.notFound('Saved search not found');
        return item;
    }
    async list(owner, smartFoldersOnly) {
        return SavedSearchRepository_1.savedSearchRepository.findByOwner(owner, smartFoldersOnly);
    }
    async create(owner, input) {
        return SavedSearchRepository_1.savedSearchRepository.create({
            owner: owner,
            name: input.name,
            icon: input.icon || 'search',
            color: input.color || '#4FD1C5',
            isSmartFolder: input.isSmartFolder || false,
            filters: input.filters,
        });
    }
    async update(id, owner, input) {
        await this.assertOwnership(id, owner);
        return SavedSearchRepository_1.savedSearchRepository.updateById(id, input);
    }
    async remove(id, owner) {
        await this.assertOwnership(id, owner);
        return SavedSearchRepository_1.savedSearchRepository.deleteById(id);
    }
}
exports.savedSearchService = new SavedSearchService();
//# sourceMappingURL=savedSearchService.js.map