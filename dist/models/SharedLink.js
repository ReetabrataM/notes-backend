"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedLink = void 0;
const mongoose_1 = require("mongoose");
const sharedLinkSchema = new mongoose_1.Schema({
    note: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Note', required: true, unique: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    isPublic: { type: Boolean, default: false },
    publicAccess: { type: String, enum: ['read', 'edit'], default: 'read' },
    collaborators: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            access: { type: String, enum: ['read', 'edit'], default: 'read' },
        },
    ],
}, { timestamps: true });
exports.SharedLink = (0, mongoose_1.model)('SharedLink', sharedLinkSchema);
//# sourceMappingURL=SharedLink.js.map