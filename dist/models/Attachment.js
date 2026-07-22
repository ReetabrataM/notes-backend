"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachment = void 0;
const mongoose_1 = require("mongoose");
const attachmentSchema = new mongoose_1.Schema({
    note: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', required: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    provider: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
attachmentSchema.index({ note: 1, order: 1 });
exports.Attachment = (0, mongoose_1.model)('Attachment', attachmentSchema);
//# sourceMappingURL=Attachment.js.map