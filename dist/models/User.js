"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: { type: String, required: function () { return !this.googleId; }, minlength: 8, select: false },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 280 },
    themePreference: {
        type: String,
        enum: ['light', 'dark', 'amoled', 'system'],
        default: 'system',
    },
    isEmailVerified: { type: Boolean, default: true },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isSuspended: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    notificationSettings: {
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
    },
}, { timestamps: true });
// email and username already get unique indexes from `unique: true` above —
// no need to declare them again here (that was causing duplicate-index warnings).
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password)
        return next();
    const salt = await bcryptjs_1.default.genSalt(12);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = async function (candidate) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.User = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.js.map