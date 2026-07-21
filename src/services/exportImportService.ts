import { marked } from 'marked';
import PDFDocument from 'pdfkit';
import { INote } from '../models/Note';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const TurndownService = require('turndown');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HTMLtoDOCX = require('html-to-docx');

const turndown = new TurndownService();

class ExportImportService {
  toMarkdown(note: Pick<INote, 'title' | 'content'>): string {
    const body = turndown.turndown(note.content || '');
    return `# ${note.title || 'Untitled Note'}\n\n${body}\n`;
  }

  async toPdfBuffer(note: Pick<INote, 'title' | 'plainText'>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.font('Helvetica-Bold').fontSize(20).text(note.title || 'Untitled Note');
      doc.moveDown();
      doc.font('Helvetica').fontSize(12).text(note.plainText || '', { align: 'left' });
      doc.end();
    });
  }

  async toDocxBuffer(note: Pick<INote, 'title' | 'content'>): Promise<Buffer> {
    const html = `<h1>${note.title || 'Untitled Note'}</h1>${note.content || ''}`;
    const buffer = await HTMLtoDOCX(html, undefined, { table: { row: { cantSplit: true } } });
    return buffer as Buffer;
  }

  /** Converts an uploaded Markdown file's text into note fields ready for creation */
  fromMarkdown(markdownText: string): { title: string; content: string; plainText: string } {
    const lines = markdownText.split('\n');
    const firstHeading = lines.find((l) => l.trim().startsWith('#'));
    const title = firstHeading ? firstHeading.replace(/^#+\s*/, '').trim() : 'Imported Note';
    const html = marked.parse(markdownText) as string;
    const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return { title, content: html, plainText };
  }
}

export const exportImportService = new ExportImportService();
