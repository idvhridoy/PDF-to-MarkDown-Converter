import express from 'express';
import multer from 'multer';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Configure in-memory file upload with 25MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents are supported.'));
    }
  },
});

app.use(express.json());

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    unstructuredConfigured: Boolean(process.env.UNSTRUCTURED_API_KEY),
    maxFileSize: '25MB',
  });
});

/**
 * Heuristic Markdown Cleaner & Table Formatter for Local Fast Parsing
 */
function formatLocalExtractedText(
  pages: { text: string; num: number }[],
  options: {
    preservePageBreaks: boolean;
    includeTOC: boolean;
    formatTables: boolean;
    cleanLineBreaks: boolean;
    stripHeadersFooters: boolean;
  }
): { markdown: string; rawText: string; pageCount: number } {
  const pageCount = pages.length || 1;
  const processedPages: string[] = [];
  const headings: { title: string; level: number; anchor: string }[] = [];

  for (let pIdx = 0; pIdx < pages.length; pIdx++) {
    const page = pages[pIdx];
    let lines = page.text.split(/\r?\n/);

    // Option: Strip repetitive header/footer artifacts
    if (options.stripHeadersFooters) {
      lines = lines.filter((line) => {
        const trimmed = line.trim();
        // Skip lone page numbers like "1", "Page 2 of 10", "-- 1 of 1 --"
        if (/^--?\s*\d+(\s+of\s+\d+)?\s*--?$/i.test(trimmed)) return false;
        if (/^page\s+\d+(\s*\/\s*\d+)?$/i.test(trimmed)) return false;
        if (/^\d+$/.test(trimmed) && trimmed.length <= 3) return false;
        return true;
      });
    }

    const pageLines: string[] = [];
    let inTable = false;
    const tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        const maxCols = Math.max(...tableRows.map((r) => r.length));
        if (maxCols >= 2) {
          // Format as Markdown table
          const header = tableRows[0];
          while (header.length < maxCols) header.push('');
          pageLines.push('| ' + header.join(' | ') + ' |');
          pageLines.push('| ' + Array(maxCols).fill('---').join(' | ') + ' |');

          for (let i = 1; i < tableRows.length; i++) {
            const row = tableRows[i];
            while (row.length < maxCols) row.push('');
            pageLines.push('| ' + row.join(' | ') + ' |');
          }
          pageLines.push('');
        } else {
          // If only 1 column, output regular lines
          for (const row of tableRows) {
            pageLines.push(row.join(' '));
          }
        }
        tableRows.length = 0;
      }
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Option: Clean hyphenation wrapping (e.g. "commer- \n cial")
      if (options.cleanLineBreaks && line.endsWith('-') && i + 1 < lines.length) {
        line = line.slice(0, -1) + lines[i + 1].trimStart();
        i++;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        if (inTable) flushTable();
        pageLines.push('');
        continue;
      }

      // Check if line looks like a tabular row (e.g. 2 or more columns separated by 2+ spaces or tabs)
      const colMatches = trimmed.split(/\s{2,}|\t/).map((c) => c.trim()).filter(Boolean);
      const isTableLike = options.formatTables && colMatches.length >= 2 && trimmed.length > 8;

      if (isTableLike) {
        inTable = true;
        tableRows.push(colMatches);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Check for headings
      const isH1 =
        /^[A-Z0-9\s]{4,60}$/.test(trimmed) &&
        !trimmed.endsWith('.') &&
        (i === 0 || lines[i - 1]?.trim() === '');
      const isNumberedH2 = /^(\d+\.|\d+\.\d+)\s+[A-Z][A-Za-z0-9\s-]{2,80}$/.test(trimmed);
      const isHeaderPrefix = /^#{1,4}\s+/.test(trimmed);

      if (isHeaderPrefix) {
        const cleanTitle = trimmed.replace(/^#{1,4}\s+/, '');
        const anchor = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ title: cleanTitle, level: 2, anchor });
        pageLines.push(trimmed);
      } else if (isH1 && pIdx === 0 && i === 0) {
        // Document main title
        headings.push({
          title: trimmed,
          level: 1,
          anchor: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        });
        pageLines.push(`# ${trimmed}\n`);
      } else if (isNumberedH2) {
        headings.push({
          title: trimmed,
          level: 2,
          anchor: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        });
        pageLines.push(`\n## ${trimmed}\n`);
      } else if (/^[•*–-]\s+/.test(trimmed)) {
        // Normalize bullet points
        pageLines.push(trimmed.replace(/^[•*–-]\s+/, '- '));
      } else {
        pageLines.push(trimmed);
      }
    }

    if (inTable) flushTable();

    let pageContent = pageLines.join('\n');

    // Page breaks preservation
    if (options.preservePageBreaks && pages.length > 1) {
      pageContent = `\n\n---\n*Page ${page.num || pIdx + 1} of ${pageCount}*\n\n` + pageContent;
    }

    processedPages.push(pageContent);
  }

  let fullMarkdown = processedPages.join('\n\n');

  // Option: Insert generated Table of Contents
  if (options.includeTOC && headings.length > 1) {
    const tocList = headings
      .map((h) => `${'  '.repeat(Math.max(0, h.level - 1))}- [${h.title}](#${h.anchor})`)
      .join('\n');
    const tocBlock = `## Table of Contents\n\n${tocList}\n\n---\n\n`;
    fullMarkdown = tocBlock + fullMarkdown;
  }

  const rawText = pages.map((p) => p.text).join('\n\n');
  return { markdown: fullMarkdown.trim(), rawText, pageCount };
}

// Core API Route: /api/convert
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ error: 'No PDF file was uploaded or file was empty.' });
    }

    // Verify PDF header magic bytes
    const pdfMagic = req.file.buffer.subarray(0, 5).toString('ascii');
    if (!pdfMagic.startsWith('%PDF')) {
      return res.status(400).json({
        error: 'Invalid PDF format: File header does not contain standard %PDF magic bytes.',
      });
    }

    // Parse options
    let options = {
      mode: 'fast',
      preservePageBreaks: true,
      includeTOC: false,
      formatTables: true,
      cleanLineBreaks: true,
      stripHeadersFooters: true,
    };

    if (req.body.options) {
      try {
        const parsedOptions = typeof req.body.options === 'string' ? JSON.parse(req.body.options) : req.body.options;
        options = { ...options, ...parsedOptions };
      } catch {
        // default options
      }
    }

    const startTime = performance.now();
    const mode = options.mode || 'fast';

    // Advanced OCR / Complex Layout mode using Gemini 3.8 Flash
    if (mode === 'ocr' && process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const prompt = `You are a world-class document analysis and Markdown converter. Convert this attached PDF document into clean, standard GitHub Flavored Markdown (GFM).
Strict Instructions:
1. Detect and preserve hierarchical headings (#, ##, ###, ####).
2. Convert all structured tables into standard Markdown tables with aligned header rows and separator lines (| Col 1 | Col 2 |).
3. Detect multi-column text layouts and re-order them into natural reading sequence.
4. Perform OCR for any scanned text, diagrams, and callouts.
5. Format code blocks with language identifiers (\`\`\`typescript, \`\`\`json, \`\`\`bash, etc.).
6. Standardize bullet lists (-) and numbered lists (1.).
7. ${options.preservePageBreaks ? 'Separate pages with horizontal rules and page labels (e.g. "\\n\\n---\\n*Page N*\\n\\n").' : 'Merge page text smoothly without abrupt breaks.'}
8. ${options.includeTOC ? 'Include an automatically generated Table of Contents with Markdown anchor links at the top.' : 'Do not include a synthetic TOC unless present in document.'}
9. Output ONLY the raw Markdown content. Do NOT wrap output in triple backticks (\`\`\`markdown) or provide introductory/concluding explanations.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: req.file.buffer.toString('base64'),
              },
            },
            { text: prompt },
          ],
        });

        let extractedMarkdown = response.text || '';
        // Clean any residual markdown wrapping if present
        if (extractedMarkdown.startsWith('```markdown')) {
          extractedMarkdown = extractedMarkdown.replace(/^```markdown\s*/, '').replace(/```\s*$/, '');
        } else if (extractedMarkdown.startsWith('```')) {
          extractedMarkdown = extractedMarkdown.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        const durationMs = Math.round(performance.now() - startTime);

        return res.json({
          success: true,
          markdown: extractedMarkdown.trim(),
          rawText: extractedMarkdown.trim(),
          pageCount: 1,
          durationMs,
          modeUsed: 'ocr',
        });
      } catch (aiError: unknown) {
        console.warn('AI OCR parsing encountered error, falling back to local parsing:', aiError);
        // Fall back seamlessly to local parser
      }
    }

    // Default & Fast Text Extraction using PDFParse
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: req.file.buffer });
    const textResult = await parser.getText();
    const pages = (textResult.pages && textResult.pages.length > 0)
      ? textResult.pages
      : [{ text: textResult.text || '', num: 1 }];

    const formatted = formatLocalExtractedText(pages, options);
    const durationMs = Math.round(performance.now() - startTime);

    return res.json({
      success: true,
      markdown: formatted.markdown,
      rawText: formatted.rawText,
      pageCount: formatted.pageCount,
      durationMs,
      modeUsed: 'fast',
    });
  } catch (err: unknown) {
    console.error('PDF Conversion error:', err);
    const message = err instanceof Error ? err.message : 'Failed to parse PDF document.';
    return res.status(500).json({
      error: `PDF Processing Error: ${message}. If this PDF is encrypted with a password, please remove password protection first.`,
    });
  }
});

// Vite / Static Files Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuMark Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
