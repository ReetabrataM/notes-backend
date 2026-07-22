"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = require("mongoose");
const noteSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200, default: 'Untitled Note' },
    content: { type: String, default: '' }, // TipTap JSON/HTML
    plainText: { type: String, default: '', index: 'text' },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Folder', default: null },
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Tag' }],
    links: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Note' }],
    color: { type: String, default: '#FFFFFF' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'none'], default: 'none' },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    wordCount: { type: Number, default: 0 },
    characterCount: { type: Number, default: 0 },
    readingTimeMinutes: { type: Number, default: 0 },
    embedding: { type: [Number], default: [], select: false },
    embeddingUpdatedAt: { type: Date, default: null, select: false },
}, { timestamps: true });
noteSchema.index({ owner: 1, isDeleted: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ owner: 1, folder: 1 });
noteSchema.index({ title: 'text', plainText: 'text' });
noteSchema.index({ links: 1 });
noteSchema.pre('save', function (next) {
    if (this.isModified('plainText')) {
        const words = this.plainText.trim().split(/\s+/).filter(Boolean);
        this.wordCount = words.length;
        this.characterCount = this.plainText.length;
        this.readingTimeMinutes = Math.max(1, Math.ceil(words.length / 200));
    }
    next();
});
exports.Note = (0, mongoose_1.model)('Note', noteSchema);
//# sourceMappingURL=Note.js.map