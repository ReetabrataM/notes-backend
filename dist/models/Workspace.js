"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workspace = void 0;
const mongoose_1 = require("mongoose");
const workspaceSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
        },
    ],
    color: { type: String, default: '#4FD1C5' },
    icon: { type: String, default: 'users' },
}, { timestamps: true });
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
exports.Workspace = (0, mongoose_1.model)('Workspace', workspaceSchema);
//# sourceMappingURL=Workspace.js.map