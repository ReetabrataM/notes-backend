import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { noteService } from '../services/noteService';
import { AuthRequest } from '../middlewares/authenticate';

export const listNotes = asyncHandler(async (req: AuthRequest, res) => {
  const {
    page,
    limit,
    search,
    folder,
    priority,
    color,
    isPinned,
    isArchived,
    isFavorite,
    isDeleted,
    tags,
    tagPrefix,
    dateFrom,
    dateTo,
    hasAttachments,
    attachmentType,
  } = req.query as Record<string, any>;

  const result = await noteService.list({
    owner: req.userId!,
    page,
    limit,
    search,
    folder,
    priority,
    color,
    tags: tags ? String(tags).split(',') : undefined,
    tagPrefix,
    dateFrom,
    dateTo,
    hasAttachments: hasAttachments !== undefined ? hasAttachments === 'true' : undefined,
    attachmentType,
    isPinned: isPinned !== undefined ? isPinned === 'true' : undefined,
    isArchived: isArchived !== undefined ? isArchived === 'true' : undefined,
    isFavorite: isFavorite !== undefined ? isFavorite === 'true' : undefined,
    isDeleted: isDeleted !== undefined ? isDeleted === 'true' : undefined,
  });

  return ApiResponse.success(res, result.items, 'Notes fetched', 200, result.meta);
});

export const getNote = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.getById(req.params.id, req.userId!);
  return ApiResponse.success(res, note, 'Note fetched');
});

export const createNote = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.create(req.userId!, req.body);
  return ApiResponse.created(res, note, 'Note created');
});

export const updateNote = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.update(req.params.id, req.userId!, req.body);
  return ApiResponse.success(res, note, 'Note updated');
});

export const softDeleteNote = asyncHandler(async (req: AuthRequest, res) => {
  await noteService.softDelete(req.params.id, req.userId!);
  return ApiResponse.success(res, null, 'Note moved to trash');
});

export const restoreNote = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.restore(req.params.id, req.userId!);
  return ApiResponse.success(res, note, 'Note restored');
});

export const permanentDeleteNote = asyncHandler(async (req: AuthRequest, res) => {
  await noteService.permanentDelete(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Note permanently deleted');
});

export const togglePin = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.togglePin(req.params.id, req.userId!);
  return ApiResponse.success(res, note, 'Note pin toggled');
});

export const toggleArchive = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.toggleArchive(req.params.id, req.userId!);
  return ApiResponse.success(res, note, 'Note archive toggled');
});

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.toggleFavorite(req.params.id, req.userId!);
  return ApiResponse.success(res, note, 'Note favorite toggled');
});

export const duplicateNote = asyncHandler(async (req: AuthRequest, res) => {
  const note = await noteService.duplicate(req.params.id, req.userId!);
  return ApiResponse.created(res, note, 'Note duplicated');
});

export const bulkDelete = asyncHandler(async (req: AuthRequest, res) => {
  await noteService.bulkSoftDelete(req.body.noteIds, req.userId!);
  return ApiResponse.success(res, null, 'Notes moved to trash');
});

export const bulkArchive = asyncHandler(async (req: AuthRequest, res) => {
  await noteService.bulkArchive(req.body.noteIds, req.userId!, req.body.isArchived !== false);
  return ApiResponse.success(res, null, 'Notes updated');
});

export const bulkTag = asyncHandler(async (req: AuthRequest, res) => {
  await noteService.bulkAddTags(req.body.noteIds, req.userId!, req.body.tagNames);
  return ApiResponse.success(res, null, 'Tags applied');
});

export const getBacklinks = asyncHandler(async (req: AuthRequest, res) => {
  const backlinks = await noteService.getBacklinks(req.params.id, req.userId!);
  return ApiResponse.success(res, backlinks, 'Backlinks fetched');
});

export const searchByTitle = asyncHandler(async (req: AuthRequest, res) => {
  const { q, exclude } = req.query as Record<string, string>;
  const results = await noteService.searchByTitle(req.userId!, q || '', exclude);
  return ApiResponse.success(res, results, 'Search results');
});
