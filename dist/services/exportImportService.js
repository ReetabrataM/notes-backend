"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportImportService = void 0;
const marked_1 = require("marked");
const pdfkit_1 = __importDefault(require("pdfkit"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TurndownService = require('turndown');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HTMLtoDOCX = require('html-to-docx');
const turndown = new TurndownService();
class ExportImportService {
    toMarkdown(note) {
        const body = turndown.turndown(note.content || '');
        return `# ${note.title || 'Untitled Note'}\n\n${body}\n`;
    }
    async toPdfBuffer(note) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.font('Helvetica-Bold').fontSize(20).text(note.title || 'Untitled Note');
            doc.moveDown();
            doc.font('Helvetica').fontSize(12).text(note.plainText || '', { align: 'left' });
            doc.end();
        });
    }
    async toDocxBuffer(note) {
        const html = `<h1>${note.title || 'Untitled Note'}</h1>${note.content || ''}`;
        const buffer = await HTMLtoDOCX(html, undefined, { table: { row: { cantSplit: true } } });
        return buffer;
    }
    /** Converts an uploaded Markdown file's text into note fields ready for creation */
    fromMarkdown(markdownText) {
        const lines = markdownText.split('\n');
        const firstHeading = lines.find((l) => l.trim().startsWith('#'));
        const title = firstHeading ? firstHeading.replace(/^#+\s*/, '').trim() : 'Imported Note';
        const html = marked_1.marked.parse(markdownText);
        const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return { title, content: html, plainText };
    }
}
exports.exportImportService = new ExportImportService();
//# sourceMappingURL=exportImportService.js.map