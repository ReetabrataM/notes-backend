import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { attachmentRepository } from '../repositories/AttachmentRepository';
import { ApiError } from '../utils/apiResponse';
import { sharingService } from './sharingService';
import { env } from '../config/env';
import cloudinary from '../config/cloudinary';
import { logger } from '../utils/logger';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Cloudinary only recognizes three resource types: "image", "video", and "raw".
 * Audio files are uploaded under "video" (Cloudinary's own convention — there's
 * no separate audio type). Everything else (PDF, Office docs, zip, txt) is "raw".
 * `resource_type: 'auto'` is valid for *uploads* but NOT for delete/destroy calls —
 * passing 'auto' there was a real bug: Cloudinary's destroy API silently fails
 * (or deletes the wrong asset) unless the exact original type is passed back.
 */
function cloudinaryResourceType(mimeType: string): 'image' | 'video' | 'raw' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'video';
  return 'raw';
}

function uploadBufferToCloudinary(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'marginalia-attachments',
        resource_type: cloudinaryResourceType(mimeType),
        filename_override: originalName,
        use_filename: true,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload returned no result'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

class AttachmentService {
  private async assertCanUpload(noteId: string, owner: string) {
    const level = await sharingService.getAccessLevel(noteId, owner);
    if (!level || level === 'read') throw ApiError.forbidden('You do not have permission to attach files here');
  }

  async upload(noteId: string, owner: string, file: Express.Multer.File) {
    await this.assertCanUpload(noteId, owner);
    const order = await attachmentRepository.countByNote(noteId);

    if (env.cloudinaryConfigured) {
      try {
        const { url, publicId } = await uploadBufferToCloudinary(file.buffer, file.originalname, file.mimetype);
        return attachmentRepository.create({
          note: noteId as any,
          owner: owner as any,
          filename: publicId,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url,
          provider: 'cloudinary',
          order,
        });
      } catch (error) {
        logger.error('Cloudinary upload failed', { error });
        if (env.isProd) {
          throw ApiError.internal('File upload failed. Please try again in a moment');
        }
        // fall through to local storage in development only
      }
    } else if (env.isProd) {
      // Production must not silently fall back to local disk — it doesn't
      // persist across deploys/restarts on most hosting platforms.
      throw ApiError.badRequest(
        'File storage is not configured for this deployment. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      );
    }

    ensureUploadDir();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `${unique}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);

    return attachmentRepository.create({
      note: noteId as any,
      owner: owner as any,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${filename}`,
      provider: 'local',
      order,
    });
  }

  async uploadMany(noteId: string, owner: string, files: Express.Multer.File[]) {
    const results = [];
    for (const file of files) {
      results.push(await this.upload(noteId, owner, file));
    }
    return results;
  }

  async reorder(noteId: string, userId: string, orderedIds: string[]) {
    const level = await sharingService.getAccessLevel(noteId, userId);
    if (!level) throw ApiError.notFound('Note not found');
    return attachmentRepository.reorder(noteId, orderedIds);
  }

  async list(noteId: string, userId: string) {
    const level = await sharingService.getAccessLevel(noteId, userId);
    if (!level) throw ApiError.notFound('Note not found');
    return attachmentRepository.findByNote(noteId);
  }

  async rename(attachmentId: string, userId: string, newName: string) {
    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment || attachment.owner.toString() !== userId) throw ApiError.notFound('Attachment not found');
    if (!newName.trim()) throw ApiError.badRequest('File name cannot be empty');
    return attachmentRepository.updateById(attachmentId, { originalName: newName.trim() } as any);
  }

  async remove(attachmentId: string, userId: string) {
    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment || attachment.owner.toString() !== userId) throw ApiError.notFound('Attachment not found');

    if (attachment.provider === 'local') {
      const filePath = path.join(UPLOAD_DIR, attachment.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } else if (attachment.provider === 'cloudinary' && env.cloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(attachment.filename, {
          resource_type: cloudinaryResourceType(attachment.mimeType),
        });
      } catch (error) {
        logger.error('Failed to delete Cloudinary asset', { error, filename: attachment.filename });
      }
    }

    return attachmentRepository.deleteById(attachmentId);
  }
}

export const attachmentService = new AttachmentService();
