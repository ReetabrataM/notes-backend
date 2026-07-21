import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { noteService } from '../services/noteService';
import { exportImportService } from '../services/exportImportService';
import { AuthRequest } from '../middlewares/authenticate';

export const exportMarkdown = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.getById(req.params.id, req.userId!);
  const markdown = exportImportService.toMarkdown(note);
  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="${note.title || 'note'}.md"`);
  res.send(markdown);
});

export const exportPdf = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.getById(req.params.id, req.userId!);
  const buffer = await exportImportService.toPdfBuffer(note);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${note.title || 'note'}.pdf"`);
  res.send(buffer);
});

export const exportDocx = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.getById(req.params.id, req.userId!);
  const buffer = await exportImportService.toDocxBuffer(note);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${note.title || 'note'}.docx"`);
  res.send(buffer);
});

export const importMarkdown = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const text = req.file.buffer.toString('utf-8');
  const parsed = exportImportService.fromMarkdown(text);
  const note = await noteService.create(req.userId!, parsed);
  return ApiResponse.created(res, note, 'Note imported from Markdown');
});
