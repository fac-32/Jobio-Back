import type { Express } from 'express';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

type SupportedFileType = 'pdf' | 'docx' | 'txt';
type MulterFile = Express.Multer.File;

function detectType(file: MulterFile): SupportedFileType | null {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (ext === '.pdf' || mime === 'application/pdf') return 'pdf';
    if (
        ext === '.docx' ||
        mime ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
        return 'docx';
    if (ext === '.txt' || mime.startsWith('text/')) return 'txt';

    return null;
}

export async function extractCvText(file: MulterFile): Promise<string> {
    const type = detectType(file);

    if (!type) {
        throw new Error('Unsupported file type. Allowed: PDF, DOCX, TXT.');
    }

    const buffer = file.buffer;

    switch (type) {
        case 'pdf': {
            const parser = new PDFParse({ data: buffer });
            const parsedData = await parser.getText();
            if (!parsedData.text || parsedData.text.trim().length < 30) {
                // Possible scanned PDF, you could hook OCR here later
                throw new Error('PDF appears to have no extractable text.');
            }
            return normaliseWhitespace(parsedData.text);
        }

        case 'docx': {
            const result = await mammoth.extractRawText({ buffer });
            if (!result.value || result.value.trim().length < 30) {
                throw new Error('DOCX appears to have no extractable text.');
            }
            return normaliseWhitespace(result.value);
        }

        case 'txt': {
            return normaliseWhitespace(buffer.toString('utf8'));
        }
    }
}

function normaliseWhitespace(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n') // collapse crazy blank lines
        .trim();
}
