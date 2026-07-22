"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchByTitle = exports.getBacklinks = exports.bulkTag = exports.bulkArchive = exports.bulkDelete = exports.duplicateNote = exports.toggleFavorite = exports.toggleArchive = exports.togglePin = exports.permanentDeleteNote = exports.restoreNote = exports.softDeleteNote = exports.updateNote = exports.createNote = exports.getNote = exports.listNotes = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const noteService_1 = require("../services/noteService");
exports.listNotes = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, search, folder, priority, color, isPinned, isArchived, isFavorite, isDeleted, tags, tagPrefix, dateFrom, dateTo, hasAttachments, attachmentType, } = req.query;
    const result = await noteService_1.noteService.list({
        owner: req.userId,
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
    return apiResponse_1.ApiResponse.success(res, result.items, 'Notes fetched', 200, result.meta);
});
exports.getNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.getById(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, note, 'Note fetched');
});
exports.createNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.create(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, note, 'Note created');
});
exports.updateNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.update(req.params.id, req.userId, req.body);
    return apiResponse_1.ApiResponse.success(res, note, 'Note updated');
});
exports.softDeleteNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await noteService_1.noteService.softDelete(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, null, 'Note moved to trash');
});
exports.restoreNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.restore(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, note, 'Note restored');
});
exports.permanentDeleteNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await noteService_1.noteService.permanentDelete(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Note permanently deleted');
});
exports.togglePin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.togglePin(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, note, 'Note pin toggled');
});
exports.toggleArchive = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.toggleArchive(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, note, 'Note archive toggled');
});
exports.toggleFavorite = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.toggleFavorite(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, note, 'Note favorite toggled');
});
exports.duplicateNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.duplicate(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.created(res, note, 'Note duplicated');
});
exports.bulkDelete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await noteService_1.noteService.bulkSoftDelete(req.body.noteIds, req.userId);
    return apiResponse_1.ApiResponse.success(res, null, 'Notes moved to trash');
});
exports.bulkArchive = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await noteService_1.noteService.bulkArchive(req.body.noteIds, req.userId, req.body.isArchived !== false);
    return apiResponse_1.ApiResponse.success(res, null, 'Notes updated');
});
exports.bulkTag = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await noteService_1.noteService.bulkAddTags(req.body.noteIds, req.userId, req.body.tagNames);
    return apiResponse_1.ApiResponse.success(res, null, 'Tags applied');
});
exports.getBacklinks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const backlinks = await noteService_1.noteService.getBacklinks(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, backlinks, 'Backlinks fetched');
});
exports.searchByTitle = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { q, exclude } = req.query;
    const results = await noteService_1.noteService.searchByTitle(req.userId, q || '', exclude);
    return apiResponse_1.ApiResponse.success(res, results, 'Search results');
});
//# sourceMappingURL=noteController.js.map