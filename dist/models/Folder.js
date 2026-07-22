"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folder = void 0;
const mongoose_1 = require("mongoose");
const folderSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Folder', default: null },
    workspace: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace', default: null },
    icon: { type: String, default: 'folder' },
    color: { type: String, default: '#8B909B' },
}, { timestamps: true });
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ workspace: 1 });
exports.Folder = (0, mongoose_1.model)('Folder', folderSchema);
//# sourceMappingURL=Folder.js.map