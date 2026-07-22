"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMemory = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Both attachment uploads and Markdown import use memory storage now — files are
// held in memory as a Buffer only, then the service layer decides where the bytes
// actually go (Cloudinary stream upload in production, or a local-disk fallback
// for development convenience). This avoids ever depending on local disk as the
// primary storage mechanism, which doesn't survive most cloud deployments.
const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'audio/mpeg',
    'audio/webm',
    'audio/wav',
    'audio/ogg',
];
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error(`File type "${file.mimetype}" is not allowed`));
};
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024, files: 10 },
    fileFilter,
});
exports.uploadMemory = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
//# sourceMappingURL=multer.js.map