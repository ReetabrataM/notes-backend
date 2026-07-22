"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savedSearchRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const SavedSearch_1 = require("../models/SavedSearch");
class SavedSearchRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(SavedSearch_1.SavedSearch);
    }
    async findByOwner(owner, smartFoldersOnly) {
        const filter = { owner };
        if (smartFoldersOnly)
            filter.isSmartFolder = true;
        return this.model.find(filter).sort({ name: 1 }).populate('filters.tags', 'name color').exec();
    }
}
exports.savedSearchRepository = new SavedSearchRepository();
//# sourceMappingURL=SavedSearchRepository.js.map