import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { attachmentService } from '../services/attachmentService';
import { AuthRequest } from '../middlewares/authenticate';

export const listAttachments = asyncHandler(async (req: AuthRequest, res) => {
  const attachments = await attachmentService.list(req.params.noteId, req.userId!);
  return ApiResponse.success(res, attachments, 'Attachments fetched');
});

export const uploadAttachment = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const attachment = await attachmentService.upload(req.params.noteId, req.userId!, req.file);
  return ApiResponse.created(res, attachment, 'File uploaded');
});

export const uploadAttachmentsBulk = asyncHandler(async (req: AuthRequest, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) throw ApiError.badRequest('No files uploaded');
  const attachments = await attachmentService.uploadMany(req.params.noteId, req.userId!, files);
  return ApiResponse.created(res, attachments, 'Files uploaded');
});

export const renameAttachment = asyncHandler(async (req: AuthRequest, res) => {
  const attachment = await attachmentService.rename(req.params.id, req.userId!, req.body.originalName);
  return ApiResponse.success(res, attachment, 'File renamed');
});

export const reorderAttachments = asyncHandler(async (req: AuthRequest, res) => {
  const attachments = await attachmentService.reorder(req.params.noteId, req.userId!, req.body.orderedIds);
  return ApiResponse.success(res, attachments, 'Attachments reordered');
});

export const deleteAttachment = asyncHandler(async (req: AuthRequest, res) => {
  await attachmentService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Attachment deleted');
});
