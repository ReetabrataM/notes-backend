"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
const mongoose_1 = require("mongoose");
const tagSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, lowercase: true, maxlength: 50 },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    color: { type: String, default: '#C9932E' },
}, { timestamps: true });
tagSchema.index({ owner: 1, name: 1 }, { unique: true });
exports.Tag = (0, mongoose_1.model)('Tag', tagSchema);
//# sourceMappingURL=Tag.js.map