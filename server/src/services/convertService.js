import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ZipArchive } from 'archiver';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  PageBreak,
  AlignmentType,
  WidthType,
  BorderStyle,
} from 'docx';
import mammoth from 'mammoth';
import sharp from 'sharp';
import { PDFParse } from 'pdf-parse';
import { extractTextFromImage } from './ocrService.js';

/**
 * Converts JSON or tabular data to Excel buffer (.xlsx)
 * @param {Array<Object> | Array<Array<any>>} data
 * @param {string} sheetName
 * @returns {Buffer}
 */
export const jsonToExcel = (data, sheetName = 'Sheet1') => {
  const workbook = XLSX.utils.book_new();
  let worksheet;

  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    worksheet = XLSX.utils.aoa_to_sheet(data);
  } else {
    worksheet = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : []);
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Converts Excel buffer to JSON object
 * @param {Buffer} fileBuffer
 * @returns {{ sheets: string[], data: Record<string, any[]> }}
 */
export const excelToJSON = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const result = {};

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    result[sheetName] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  });

  return {
    sheets: workbook.SheetNames,
    data: result,
  };
};

/**
 * Converts CSV string to Excel buffer (.xlsx)
 * @param {string} csvString
 * @param {string} sheetName
 * @returns {Buffer}
 */
export const csvToExcel = (csvString, sheetName = 'Sheet1') => {
  const parsed = Papa.parse(csvString, { skipEmptyLines: true });
  return jsonToExcel(parsed.data, sheetName);
};

/**
 * Converts Excel buffer to CSV string
 * @param {Buffer} fileBuffer
 * @param {string} [sheetName]
 * @returns {string}
 */
export const excelToCSV = (fileBuffer, sheetName) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const targetSheetName = sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) return '';
  return XLSX.utils.sheet_to_csv(worksheet);
};

/**
 * Converts JSON data array to CSV string
 * @param {any[]} jsonData
 * @returns {string}
 */
export const jsonToCSV = (jsonData) => {
  return Papa.unparse(jsonData);
};

/**
 * Converts CSV string to JSON array
 * @param {string} csvString
 * @returns {any[]}
 */
export const csvToJSON = (csvString) => {
  const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  return parsed.data;
};

/**
 * Converts plain text into a valid Microsoft Word (.docx) buffer
 * @param {string} text
 * @param {string} [title]
 * @returns {Promise<Buffer>}
 */
export const textToWord = async (text = '', title = '') => {
  const lines = text.split('\n');
  const paragraphs = [];

  if (title) {
    paragraphs.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 80 },
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(trimmed.replace(/^[-*]\s+/, ''))],
          bullet: { level: 0 },
          spacing: { after: 50 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
};

/**
 * High-Fidelity PDF to Word (.docx) Converter
 * Converts digital, scanned, or mixed PDF files into fully structured, editable Word documents:
 * - Strips '-- X of Y --' page markers and artifacts
 * - Auto-detects scanned/image-only pages and performs multi-page OCR
 * - Preserves headings, bold question lines, bullet points, and numbered lists
 * - Extracts and creates native Word tables from tabular blocks
 * - Embeds diagrams, figures, and scanned page images
 * - Maintains multi-page pagination with clean PageBreak separators
 *
 * @param {Buffer} pdfBuffer
 * @param {Object} [options]
 * @returns {Promise<Buffer>}
 */
export const pdfToWord = async (pdfBuffer, options = {}) => {
  const parser = new PDFParse({ data: pdfBuffer });
  let parseResult;
  try {
    parseResult = await parser.getText();
  } catch (err) {
    console.warn('[convertService] parser.getText() warning:', err.message);
    parseResult = { pages: [], total: 1, text: '' };
  }

  // Pre-load images if PDF contains scanned pages or embedded figures
  let imgResult = null;
  const getImages = async () => {
    if (!imgResult) {
      try {
        imgResult = await parser.getImage();
      } catch (_) {
        imgResult = { pages: [] };
      }
    }
    return imgResult;
  };

  const totalPages = parseResult.total || (parseResult.pages?.length || 1);
  const pageEntries = [];

  // 1. Process each page's content
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const rawPage = parseResult.pages?.[pageIdx];
    let pageText = (rawPage?.text || '').trim();

    // Strip pdf-parse page marker artifacts (e.g. "-- 1 of 9 --")
    pageText = pageText.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '').trim();

    const pageImages = [];

    // Check if page needs OCR (scanned or image-only page where text is empty or < 30 chars)
    if (pageText.length < 30) {
      const imagesData = await getImages();
      const pageImgObj = imagesData?.pages?.[pageIdx];
      if (pageImgObj?.images && pageImgObj.images.length > 0) {
        // Find largest image (main scan or primary figure)
        const sortedImgs = [...pageImgObj.images].sort((a, b) => (b.data?.length || 0) - (a.data?.length || 0));
        const mainImg = sortedImgs[0];

        if (mainImg?.dataUrl) {
          try {
            console.log(`[convertService] Running OCR on scanned page ${pageIdx + 1}/${totalPages}...`);
            const ocr = await extractTextFromImage(mainImg.dataUrl, 'eng');
            if (ocr.text && ocr.text.trim().length > 0) {
              pageText = ocr.text.trim();
            }
          } catch (ocrErr) {
            console.warn(`[convertService] OCR failed on page ${pageIdx + 1}:`, ocrErr.message);
          }

          // Also capture image buffer to embed into Word document
          try {
            const match = mainImg.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              const imgBuf = Buffer.from(match[2], 'base64');
              const origW = mainImg.width || 600;
              const origH = mainImg.height || 800;
              const scale = Math.min(1, 500 / Math.max(origW, 1));
              pageImages.push({
                buffer: imgBuf,
                width: Math.round(origW * scale),
                height: Math.round(origH * scale),
              });
            }
          } catch (_) {}
        }
      }
    } else {
      // Digital page: check if there are embedded figures/diagrams to preserve
      const imagesData = await getImages();
      const pageImgObj = imagesData?.pages?.[pageIdx];
      if (pageImgObj?.images) {
        for (const img of pageImgObj.images) {
          if ((img.width >= 100 && img.height >= 100) || (img.data?.length || 0) > 15000) {
            try {
              let imgBuf;
              if (img.dataUrl) {
                const match = img.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
                if (match) imgBuf = Buffer.from(match[2], 'base64');
              } else if (img.data) {
                imgBuf = Buffer.from(img.data);
              }
              if (imgBuf) {
                const origW = img.width || 400;
                const origH = img.height || 300;
                const scale = Math.min(1, 480 / Math.max(origW, 1));
                pageImages.push({
                  buffer: imgBuf,
                  width: Math.round(origW * scale),
                  height: Math.round(origH * scale),
                });
              }
            } catch (_) {}
          }
        }
      }
    }

    pageEntries.push({
      pageNumber: pageIdx + 1,
      text: pageText,
      images: pageImages,
    });
  }

  // 2. Build Word Document Elements
  const children = [];

  // Document Title Header if provided
  const title = options.originalName
    ? options.originalName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')
    : 'Docify Converted Document';

  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { before: 100, after: 200 },
    })
  );

  for (let pIdx = 0; pIdx < pageEntries.length; pIdx++) {
    const page = pageEntries[pIdx];

    // Page Break between pages
    if (pIdx > 0) {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }

    const lines = page.text.split('\n');
    let lineIdx = 0;

    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      const trimmed = line.trim();

      if (!trimmed) {
        lineIdx++;
        continue;
      }

      // 1. CODE BLOCK DETECTION (fenced ``` or consecutive code statements)
      const isCodeFence = trimmed.startsWith('```');
      const isCodeLine = (str) => {
        const s = str.trim();
        return (
          /^(?:import|export|from|def|class|function|const|let|var|public|private|protected|static|return|if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*\{|catch\s*\(|#include|package|SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/.test(s) ||
          /^(?:console\.log|print|System\.out\.println)\(/.test(s) ||
          /(?:=>|===|!==|[{}\[\];])$/.test(s) ||
          /^\s{4,}/.test(str)
        );
      };

      if (isCodeFence || (isCodeLine(line) && lineIdx + 1 < lines.length && isCodeLine(lines[lineIdx + 1]))) {
        const codeLines = [];
        let lang = '';
        if (isCodeFence) {
          lang = trimmed.replace(/^```/, '').trim();
          lineIdx++;
          while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith('```')) {
            codeLines.push(lines[lineIdx]);
            lineIdx++;
          }
          if (lineIdx < lines.length && lines[lineIdx].trim().startsWith('```')) {
            lineIdx++;
          }
        } else {
          while (lineIdx < lines.length && (isCodeLine(lines[lineIdx]) || (!lines[lineIdx].trim() && lineIdx + 1 < lines.length && isCodeLine(lines[lineIdx + 1])))) {
            codeLines.push(lines[lineIdx]);
            lineIdx++;
          }
        }

        if (codeLines.length > 0) {
          // Render as Word Code Box Table Cell
          const codeParagraphs = codeLines.map(
            (codeLine) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: codeLine || ' ',
                    font: 'Consolas',
                    size: 19, // 9.5pt
                    color: '1E293B',
                    preserveSpace: true,
                  }),
                ],
                spacing: { line: 240, before: 20, after: 20 },
              })
          );

          children.push(
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      children: codeParagraphs,
                      shading: { fill: 'F8FAFC' },
                      margins: { top: 120, bottom: 120, left: 180, right: 180 },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                        bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                        left: { style: BorderStyle.SINGLE, size: 24, color: '06B6D4' }, // Docify Cyan Accent
                        right: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                      },
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              spacing: { before: 100, after: 150 },
            })
          );
          continue;
        }
      }

      // 2. TABLE DETECTION (lines containing pipe '|' or 2+ tab/aligned columns)
      const isPipeTable = trimmed.includes('|') && trimmed.split('|').filter((c) => c.trim()).length >= 2;
      const isTabColumn = trimmed.includes('\t') && trimmed.split('\t').filter((c) => c.trim()).length >= 2;

      if (isPipeTable || isTabColumn) {
        const tableRows = [];
        const sep = isPipeTable ? '|' : '\t';

        while (lineIdx < lines.length) {
          const tLine = lines[lineIdx].trim();
          if (!tLine || (!tLine.includes('|') && !tLine.includes('\t'))) break;
          // Skip markdown divider rows like |---|---|
          if (!/^\|?[\s\-:|]+\|?$/.test(tLine)) {
            const rawCells = tLine.split(sep).map((c) => c.trim()).filter((_, idx, arr) => {
              if (isPipeTable && idx === 0 && tLine.startsWith('|')) return false;
              if (isPipeTable && idx === arr.length - 1 && tLine.endsWith('|')) return false;
              return true;
            });
            if (rawCells.length > 0) {
              tableRows.push(rawCells);
            }
          }
          lineIdx++;
        }

        if (tableRows.length > 0) {
          const colCount = Math.max(...tableRows.map((r) => r.length));
          const colWidthPercent = Math.floor(100 / Math.max(1, colCount));
          const docxRows = tableRows.map((r, rIndex) => {
            return new TableRow({
              children: r.map((cellText) => {
                return new TableCell({
                  width: { size: colWidthPercent, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cellText,
                          bold: rIndex === 0,
                          size: 20,
                          color: rIndex === 0 ? '0F172A' : '334155',
                        }),
                      ],
                      spacing: { line: 260, before: 40, after: 40 },
                    }),
                  ],
                  shading: rIndex === 0 ? { fill: 'F1F5F9' } : (rIndex % 2 === 1 ? { fill: 'FFFFFF' } : { fill: 'F8FAFC' }),
                  margins: { top: 100, bottom: 100, left: 140, right: 140 },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
                    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
                    left: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                    right: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                  },
                });
              }),
            });
          });

          children.push(
            new Table({
              rows: docxRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              spacing: { before: 100, after: 180 },
            })
          );
          continue;
        }
      }

      // Heading 1 detection: Markdown '# ' or all-caps short title or 'Question X:', 'Chapter X:'
      if (
        trimmed.startsWith('# ') ||
        /^(?:Question|Problem|Chapter|Unit|Section|Topic)\s+[0-9IVXLCDM]+[:.]?/i.test(trimmed) ||
        (trimmed.length > 3 && trimmed.length < 65 && trimmed === trimmed.toUpperCase() && !/[.;]$/.test(trimmed) && /[A-Z]/.test(trimmed))
      ) {
        const headingText = trimmed.replace(/^#\s+/, '');
        children.push(
          new Paragraph({
            text: headingText,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
        lineIdx++;
        continue;
      }

      // Heading 2 detection: Markdown '## ' or bold question subtopic
      if (trimmed.startsWith('## ') || /^[A-Z][a-zA-Z\s]{2,40}:$/.test(trimmed)) {
        const headingText = trimmed.replace(/^##\s+/, '');
        children.push(
          new Paragraph({
            text: headingText,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
          })
        );
        lineIdx++;
        continue;
      }

      // Bullet points
      if (/^[-*•▪o]\s+/.test(trimmed)) {
        children.push(
          new Paragraph({
            children: [new TextRun(trimmed.replace(/^[-*•▪o]\s+/, ''))],
            bullet: { level: 0 },
            spacing: { after: 60 },
          })
        );
        lineIdx++;
        continue;
      }

      // Numbered lists (e.g., 1. or 1) or (a) or a.)
      if (/^(?:\d+|[a-zA-Z])[\.\)]\s+/.test(trimmed)) {
        const match = trimmed.match(/^((?:\d+|[a-zA-Z])[\.\)])\s+(.*)$/);
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${match ? match[1] : ''} `, bold: true }),
              new TextRun(match ? match[2] : trimmed),
            ],
            spacing: { after: 60 },
          })
        );
        lineIdx++;
        continue;
      }

      // Standard body paragraph
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })], // 11pt
          spacing: { after: 100 },
        })
      );
      lineIdx++;
    }

    // Embed visual diagrams / figures for this page
    if (page.images && page.images.length > 0) {
      for (const img of page.images) {
        try {
          const safePngBuffer = await sharp(img.buffer).png().toBuffer();
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: safePngBuffer,
                  transformation: { width: Math.min(500, img.width || 400), height: Math.min(650, img.height || 300) },
                }),
              ],
              spacing: { before: 120, after: 180 },
            })
          );
        } catch (imgErr) {
          console.warn('[convertService] ImageRun embed error:', imgErr.message);
        }
      }
    }
  }

  // Fallback if document has no paragraphs
  if (children.length === 0) {
    children.push(
      new Paragraph({
        text: 'Document converted successfully by Docify.',
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 22,
            color: '1F2937',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
};

/**
 * Extracts raw text from Word document buffer (.docx)
 * @param {Buffer} fileBuffer
 * @returns {Promise<{ text: string }>}
 */
export const wordToText = async (fileBuffer) => {
  const res = await mammoth.extractRawText({ buffer: fileBuffer });
  return {
    text: res.value || '',
  };
};

/**
 * Creates and streams a ZIP archive containing multiple files directly into an Express Response
 * @param {Array<{ name: string, buffer: Buffer | Uint8Array }>} files
 * @param {import('express').Response} res
 * @param {string} zipFilename
 */
export const streamZipArchive = (files, res, zipFilename = 'docify-bundle.zip') => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('[convertService] ZIP archiver error:', err);
    if (!res.headersSent) {
      res.status(500).send({ success: false, message: 'Failed to generate zip file' });
    }
  });

  archive.pipe(res);

  files.forEach((file) => {
    archive.append(Buffer.from(file.buffer), { name: file.name });
  });

  archive.finalize();
};
