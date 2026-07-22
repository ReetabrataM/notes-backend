"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importMarkdown = exports.exportDocx = exports.exportPdf = exports.exportMarkdown = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const noteService_1 = require("../services/noteService");
const exportImportService_1 = require("../services/exportImportService");
exports.exportMarkdown = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.getById(req.params.id, req.userId);
    const markdown = exportImportService_1.exportImportService.toMarkdown(note);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title || 'note'}.md"`);
    res.send(markdown);
});
exports.exportPdf = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.getById(req.params.id, req.userId);
    const buffer = await exportImportService_1.exportImportService.toPdfBuffer(note);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title || 'note'}.pdf"`);
    res.send(buffer);
});
exports.exportDocx = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await noteService_1.noteService.getById(req.params.id, req.userId);
    const buffer = await exportImportService_1.exportImportService.toDocxBuffer(note);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title || 'note'}.docx"`);
    res.send(buffer);
});
exports.importMarkdown = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw apiResponse_1.ApiError.badRequest('No file uploaded');
    const text = req.file.buffer.toString('utf-8');
    const parsed = exportImportService_1.exportImportService.fromMarkdown(text);
    const note = await noteService_1.noteService.create(req.userId, parsed);
    return apiResponse_1.ApiResponse.created(res, note, 'Note imported from Markdown');
});
//# sourceMappingURL=exportImportController.js.map