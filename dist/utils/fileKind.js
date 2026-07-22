"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kindToMimePattern = kindToMimePattern;
/**
 * Mirrors the frontend's attachmentUtils.kindOf() classification, but in reverse —
 * given a "kind" filter (image/pdf/document/video/audio/archive), returns a Mongo
 * query fragment matching attachments of that kind by mimeType. Kept as a single
 * shared source of truth for what each kind means so the two ends of the filter
 * (frontend labels, backend query) can't silently drift apart.
 */
function kindToMimePattern(kind) {
    switch (kind) {
        case 'image':
            return { mimeType: { $regex: '^image/' } };
        case 'pdf':
            return { mimeType: 'application/pdf' };
        case 'video':
            return { mimeType: { $regex: '^video/' } };
        case 'audio':
            return { mimeType: { $regex: '^audio/' } };
        case 'archive':
            return { mimeType: { $regex: 'zip' } };
        case 'document':
            return {
                mimeType: {
                    $regex: 'word|excel|powerpoint|spreadsheet|presentation|^text/plain$',
                },
            };
        default:
            return null;
    }
}
//# sourceMappingURL=fileKind.js.map