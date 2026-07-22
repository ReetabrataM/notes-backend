"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedSearch = void 0;
const mongoose_1 = require("mongoose");
const savedSearchSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    icon: { type: String, default: 'search' },
    color: { type: String, default: '#4FD1C5' },
    isSmartFolder: { type: Boolean, default: false },
    filters: {
        search: { type: String, default: '' },
        tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Tag' }],
        tagPrefix: { type: String, default: '' },
        folder: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Folder', default: null },
        priority: { type: String, default: '' },
        color: { type: String, default: '' },
        isPinned: { type: Boolean, default: undefined },
        isFavorite: { type: Boolean, default: undefined },
        isArchived: { type: Boolean, default: undefined },
        dateFrom: { type: Date, default: null },
        dateTo: { type: Date, default: null },
        hasAttachments: { type: Boolean, default: undefined },
        attachmentType: { type: String, default: '' },
    },
}, { timestamps: true });
savedSearchSchema.index({ owner: 1, isSmartFolder: 1 });
exports.SavedSearch = (0, mongoose_1.model)('SavedSearch', savedSearchSchema);
//# sourceMappingURL=SavedSearch.js.map