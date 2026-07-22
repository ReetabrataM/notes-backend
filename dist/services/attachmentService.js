"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const AttachmentRepository_1 = require("../repositories/AttachmentRepository");
const apiResponse_1 = require("../utils/apiResponse");
const sharingService_1 = require("./sharingService");
const env_1 = require("../config/env");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const logger_1 = require("../utils/logger");
const UPLOAD_DIR = path_1.default.join(__dirname, '..', '..', 'uploads');
function ensureUploadDir() {
    if (!fs_1.default.existsSync(UPLOAD_DIR))
        fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
/**
 * Cloudinary only recognizes three resource types: "image", "video", and "raw".
 * Audio files are uploaded under "video" (Cloudinary's own convention — there's
 * no separate audio type). Everything else (PDF, Office docs, zip, txt) is "raw".
 * `resource_type: 'auto'` is valid for *uploads* but NOT for delete/destroy calls —
 * passing 'auto' there was a real bug: Cloudinary's destroy API silently fails
 * (or deletes the wrong asset) unless the exact original type is passed back.
 */
function cloudinaryResourceType(mimeType) {
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.startsWith('video/') || mimeType.startsWith('audio/'))
        return 'video';
    return 'raw';
}
function uploadBufferToCloudinary(buffer, originalName, mimeType) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({
            folder: 'marginalia-attachments',
            resource_type: cloudinaryResourceType(mimeType),
            filename_override: originalName,
            use_filename: true,
        }, (error, result) => {
            if (error || !result)
                return reject(error || new Error('Cloudinary upload returned no result'));
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        stream_1.Readable.from(buffer).pipe(stream);
    });
}
class AttachmentService {
    async assertCanUpload(noteId, owner) {
        const level = await sharingService_1.sharingService.getAccessLevel(noteId, owner);
        if (!level || level === 'read')
            throw apiResponse_1.ApiError.forbidden('You do not have permission to attach files here');
    }
    async upload(noteId, owner, file) {
        await this.assertCanUpload(noteId, owner);
        const order = await AttachmentRepository_1.attachmentRepository.countByNote(noteId);
        if (env_1.env.cloudinaryConfigured) {
            try {
                const { url, publicId } = await uploadBufferToCloudinary(file.buffer, file.originalname, file.mimetype);
                return AttachmentRepository_1.attachmentRepository.create({
                    note: noteId,
                    owner: owner,
                    filename: publicId,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url,
                    provider: 'cloudinary',
                    order,
                });
            }
            catch (error) {
                logger_1.logger.error('Cloudinary upload failed', { error });
                if (env_1.env.isProd) {
                    throw apiResponse_1.ApiError.internal('File upload failed. Please try again in a moment');
                }
                // fall through to local storage in development only
            }
        }
        else if (env_1.env.isProd) {
            // Production must not silently fall back to local disk — it doesn't
            // persist across deploys/restarts on most hosting platforms.
            throw apiResponse_1.ApiError.badRequest('File storage is not configured for this deployment. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
        }
        ensureUploadDir();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        const filename = `${unique}${ext}`;
        fs_1.default.writeFileSync(path_1.default.join(UPLOAD_DIR, filename), file.buffer);
        return AttachmentRepository_1.attachmentRepository.create({
            note: noteId,
            owner: owner,
            filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${filename}`,
            provider: 'local',
            order,
        });
    }
    async uploadMany(noteId, owner, files) {
        const results = [];
        for (const file of files) {
            results.push(await this.upload(noteId, owner, file));
        }
        return results;
    }
    async reorder(noteId, userId, orderedIds) {
        const level = await sharingService_1.sharingService.getAccessLevel(noteId, userId);
        if (!level)
            throw apiResponse_1.ApiError.notFound('Note not found');
        return AttachmentRepository_1.attachmentRepository.reorder(noteId, orderedIds);
    }
    async list(noteId, userId) {
        const level = await sharingService_1.sharingService.getAccessLevel(noteId, userId);
        if (!level)
            throw apiResponse_1.ApiError.notFound('Note not found');
        return AttachmentRepository_1.attachmentRepository.findByNote(noteId);
    }
    async rename(attachmentId, userId, newName) {
        const attachment = await AttachmentRepository_1.attachmentRepository.findById(attachmentId);
        if (!attachment || attachment.owner.toString() !== userId)
            throw apiResponse_1.ApiError.notFound('Attachment not found');
        if (!newName.trim())
            throw apiResponse_1.ApiError.badRequest('File name cannot be empty');
        return AttachmentRepository_1.attachmentRepository.updateById(attachmentId, { originalName: newName.trim() });
    }
    async remove(attachmentId, userId) {
        const attachment = await AttachmentRepository_1.attachmentRepository.findById(attachmentId);
        if (!attachment || attachment.owner.toString() !== userId)
            throw apiResponse_1.ApiError.notFound('Attachment not found');
        if (attachment.provider === 'local') {
            const filePath = path_1.default.join(UPLOAD_DIR, attachment.filename);
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        }
        else if (attachment.provider === 'cloudinary' && env_1.env.cloudinaryConfigured) {
            try {
                await cloudinary_1.default.uploader.destroy(attachment.filename, {
                    resource_type: cloudinaryResourceType(attachment.mimeType),
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to delete Cloudinary asset', { error, filename: attachment.filename });
            }
        }
        return AttachmentRepository_1.attachmentRepository.deleteById(attachmentId);
    }
}
exports.attachmentService = new AttachmentService();
//# sourceMappingURL=attachmentService.js.map