import path from 'path';
import fs from 'fs';
import { Document } from '../models/Document.js';
import { Summary } from '../models/Summary.js';
import { parseDocument } from '../services/documentParserService.js';
import {
  generateSummary,
  extractKeyInfo,
  detectSentimentAndCategory,
  translateContent,
  generateMindMap,
  generateStudyNotes,
  extractCitations,
  highlightSalientSentences,
  checkSimilarity,
} from '../services/aiService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';

/**
 * Helper to verify document existence and ownership
 */
const getAuthorizedDocument = async (docId, userId, userRole) => {
  const document = await Document.findById(docId);
  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (document.userId.toString() !== userId.toString() && userRole !== 'admin') {
    const error = new Error('Access denied. You do not own this document.');
    error.statusCode = 403;
    throw error;
  }

  return document;
};

/**
 * 3-Level Abstraction Summary Controller
 * POST /api/documents/:id/summarize
 */
export const getOrGenerateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { depth = 'all', language = 'en', forceRefresh = false } = { ...req.query, ...req.body };
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await getAuthorizedDocument(id, userId, req.user?.role);

    // Check if summary already exists in DB for this document and requested language
    if (!forceRefresh) {
      const existingSummary = await Summary.findOne({
        documentId: id,
        language,
      });

      if (existingSummary && existingSummary.detailedSummary && !existingSummary.detailedSummary.includes('completely blank')) {
        return successResponse(
          res,
          existingSummary,
          'Cached document summary retrieved successfully'
        );
      }
    }

    // Auto-repair: If document extractedText is empty, blank newlines, or < 50 chars, run on-the-fly OCR
    let textToSummarize = (document.extractedText || '').trim();
    if (textToSummarize.length < 50) {
      console.log(`[DocumentAiController] Document "${document.originalName}" (${id}) has minimal text (${textToSummarize.length} chars). Re-parsing with OCR on disk...`);
      const filePath = path.resolve(process.cwd(), 'uploads', document.fileName);
      if (fs.existsSync(filePath)) {
        try {
          const reParsed = await parseDocument(filePath, document.mimeType, document.originalName);
          if (reParsed.extractedText && reParsed.extractedText.trim().length > 30) {
            document.extractedText = reParsed.extractedText;
            document.pages = reParsed.pages;
            document.pageCount = reParsed.pageCount;
            document.wordCount = reParsed.wordCount;
            document.readingTimeMinutes = reParsed.readingTimeMinutes;
            document.ocrProcessed = reParsed.ocrProcessed;
            document.detectedLanguage = reParsed.detectedLanguage;
            await document.save();
            textToSummarize = reParsed.extractedText.trim();
            console.log(`[DocumentAiController] Document "${document.originalName}" successfully re-populated with OCR text (${textToSummarize.length} chars).`);
          }
        } catch (repairErr) {
          console.warn('[DocumentAiController] Automatic OCR repair warning:', repairErr.message);
        }
      }
    }

    if (!textToSummarize) {
      textToSummarize = `Document Title: ${document.originalName}. File type: ${document.fileType}. Pages: ${document.pageCount || 1}.`;
    }

    // Concurrently generate summary, key info, and sentiment for comprehensive analysis
    const [summaryResult, keyInfoResult, sentimentResult] = await Promise.all([
      generateSummary(textToSummarize, depth, language),
      extractKeyInfo(textToSummarize),
      detectSentimentAndCategory(textToSummarize),
    ]);

    // Upsert or create summary record in database
    const summaryData = {
      documentId: id,
      userId,
      shortSummary: summaryResult.short,
      mediumSummary: summaryResult.medium,
      detailedSummary: summaryResult.detailed,
      keyInfo: keyInfoResult,
      sentiment: {
        label: sentimentResult.sentiment,
        score: sentimentResult.sentimentScore,
        reason: sentimentResult.sentimentReason,
      },
      category: {
        name: sentimentResult.category,
        confidence: sentimentResult.categoryConfidence,
      },
      language,
    };

    const savedSummary = await Summary.findOneAndUpdate(
      { documentId: id, language },
      { $set: summaryData },
      { new: true, upsert: true, runValidators: true }
    );

    return successResponse(
      res,
      savedSummary,
      'Document 3-level abstraction summary generated successfully',
      200
    );
  } catch (error) {
    console.error('[documentAiController] getOrGenerateSummary error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to generate document summary',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Entity & Key Information Extraction Controller
 * GET /api/documents/:id/key-info
 */
export const getKeyInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await getAuthorizedDocument(id, userId, req.user?.role);

    // Check if keyInfo already cached in Summary
    const existingSummary = await Summary.findOne({ documentId: id });
    if (
      existingSummary?.keyInfo &&
      (existingSummary.keyInfo.people?.length > 0 ||
        existingSummary.keyInfo.organizations?.length > 0 ||
        existingSummary.keyInfo.keywords?.length > 0)
    ) {
      return successResponse(
        res,
        existingSummary.keyInfo,
        'Key information retrieved from cache'
      );
    }

    // Otherwise extract afresh
    const text = document.extractedText || document.originalName;
    const keyInfo = await extractKeyInfo(text);

    // Cache if a summary exists
    if (existingSummary) {
      existingSummary.keyInfo = keyInfo;
      await existingSummary.save();
    }

    return successResponse(res, keyInfo, 'Key information extracted successfully');
  } catch (error) {
    console.error('[documentAiController] getKeyInfo error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to extract key information',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Sentiment & Category Detection Controller
 * GET /api/documents/:id/sentiment
 */
export const getSentimentAndCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await getAuthorizedDocument(id, userId, req.user?.role);

    // Check if already cached in Summary
    const existingSummary = await Summary.findOne({ documentId: id });
    if (existingSummary?.sentiment?.label && existingSummary?.category?.name) {
      return successResponse(
        res,
        {
          sentiment: existingSummary.sentiment,
          category: existingSummary.category,
        },
        'Sentiment and category retrieved from cache'
      );
    }

    const text = document.extractedText || document.originalName;
    const result = await detectSentimentAndCategory(text);

    const sentiment = {
      label: result.sentiment,
      score: result.sentimentScore,
      reason: result.sentimentReason,
    };
    const category = {
      name: result.category,
      confidence: result.categoryConfidence,
    };

    if (existingSummary) {
      existingSummary.sentiment = sentiment;
      existingSummary.category = category;
      await existingSummary.save();
    }

    return successResponse(
      res,
      { sentiment, category },
      'Sentiment and category detected successfully'
    );
  } catch (error) {
    console.error('[documentAiController] getSentimentAndCategory error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to detect sentiment and category',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Multilingual AI Translation Controller
 * POST /api/documents/:id/translate
 */
export const translateDocSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetLang = 'gu', forceRefresh = false } = req.body;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    if (!['en', 'gu', 'hi'].includes(targetLang)) {
      return errorResponse(res, 'Invalid target language. Supported: en, gu, hi', 400);
    }

    const document = await getAuthorizedDocument(id, userId, req.user?.role);

    // Find base summary or generate one if none exists yet
    let baseSummary = await Summary.findOne({ documentId: id, language: 'en' });
    if (!baseSummary) {
      baseSummary = await Summary.findOne({ documentId: id });
    }

    if (!baseSummary) {
      // Generate initial summary
      const text = document.extractedText || document.originalName;
      const initialSummary = await generateSummary(text, 'all', 'en');
      baseSummary = await Summary.create({
        documentId: id,
        userId,
        shortSummary: initialSummary.short,
        mediumSummary: initialSummary.medium,
        detailedSummary: initialSummary.detailed,
        language: 'en',
      });
    }

    // Check if target translation is already cached in summary.translations Map
    if (!forceRefresh && baseSummary.translations?.has(targetLang)) {
      const cached = baseSummary.translations.get(targetLang);
      return successResponse(
        res,
        {
          targetLang,
          short: cached.short,
          medium: cached.medium,
          detailed: cached.detailed,
          cached: true,
        },
        `Cached ${targetLang} translation retrieved successfully`
      );
    }

    // Translate the 3 levels of abstraction
    const contentToTranslate = {
      short: baseSummary.shortSummary,
      medium: baseSummary.mediumSummary,
      detailed: baseSummary.detailedSummary,
    };

    const translated = await translateContent(contentToTranslate, targetLang);

    // Save into translations map
    if (!baseSummary.translations) {
      baseSummary.translations = new Map();
    }
    baseSummary.translations.set(targetLang, {
      short: translated.short || '',
      medium: Array.isArray(translated.medium) ? translated.medium : [],
      detailed: translated.detailed || '',
      translatedAt: new Date(),
    });

    await baseSummary.save();

    return successResponse(
      res,
      {
        targetLang,
        short: translated.short,
        medium: translated.medium,
        detailed: translated.detailed,
        cached: false,
      },
      `Summary translated into ${targetLang} successfully`
    );
  } catch (error) {
    console.error('[documentAiController] translateDocSummary error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to translate summary',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Mind Map Visualizer Controller
 * GET /api/documents/:id/mindmap
 */
export const getMindMap = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en', forceRefresh = 'false' } = req.query;
    const shouldRefresh = forceRefresh === 'true';
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await getAuthorizedDocument(id, userId, req.user?.role);

    // Check cached mindmap
    if (!shouldRefresh) {
      const existingSummary = await Summary.findOne({ documentId: id, language });
      if (existingSummary?.mindMap && existingSummary.mindMap.label) {
        return successResponse(
          res,
          { mindMap: existingSummary.mindMap, language, cached: true },
          'Mind map retrieved from cache'
        );
      }
    }

    const text = document.extractedText || document.originalName;
    const mindMap = await generateMindMap(text, language);

    // Upsert into summary
    await Summary.findOneAndUpdate(
      { documentId: id, language },
      {
        $set: {
          documentId: id,
          userId,
          mindMap,
          language,
        },
      },
      { upsert: true, new: true }
    );

    return successResponse(
      res,
      { mindMap, language, cached: false },
      'Visual mind map generated successfully'
    );
  } catch (error) {
    console.error('[documentAiController] getMindMap error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to generate visual mind map',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Exam Study Notes Controller
 * GET /api/documents/:id/notes
 */
export const getStudyNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en', forceRefresh = 'false' } = req.query;
    const shouldRefresh = forceRefresh === 'true';
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await getAuthorizedDocument(id, userId, req.user?.role);

    if (!shouldRefresh) {
      const existingSummary = await Summary.findOne({ documentId: id, language });
      if (existingSummary?.studyNotes && existingSummary.studyNotes.length > 50) {
        return successResponse(
          res,
          { studyNotes: existingSummary.studyNotes, language, cached: true },
          'Study notes retrieved from cache'
        );
      }
    }

    const text = document.extractedText || document.originalName;
    const studyNotes = await generateStudyNotes(text, language);

    await Summary.findOneAndUpdate(
      { documentId: id, language },
      {
        $set: {
          documentId: id,
          userId,
          studyNotes,
          language,
        },
      },
      { upsert: true, new: true }
    );

    return successResponse(
      res,
      { studyNotes, language, cached: false },
      'Exam study notes generated successfully'
    );
  } catch (error) {
    console.error('[documentAiController] getStudyNotes error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to generate exam study notes',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Citation & Reference Extractor Controller
 * GET /api/documents/:id/citations
 */
export const getCitations = async (req, res) => {
  try {
    const { id } = req.params;
    const { forceRefresh = 'false' } = req.query;
    const shouldRefresh = forceRefresh === 'true';
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await getAuthorizedDocument(id, userId, req.user?.role);

    if (!shouldRefresh) {
      const existingSummary = await Summary.findOne({ documentId: id });
      if (existingSummary?.citations && existingSummary.citations.length > 0) {
        return successResponse(
          res,
          { citations: existingSummary.citations, count: existingSummary.citations.length, cached: true },
          'Citations retrieved from cache'
        );
      }
    }

    const text = document.extractedText || document.originalName;
    const citations = await extractCitations(text);

    // Save to summary
    await Summary.findOneAndUpdate(
      { documentId: id },
      { $set: { citations } },
      { upsert: false }
    );

    return successResponse(
      res,
      { citations, count: citations.length, cached: false },
      'Citations extracted successfully'
    );
  } catch (error) {
    console.error('[documentAiController] getCitations error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to extract citations',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Salient Sentences Highlighter Controller
 * GET /api/documents/:id/highlights
 */
export const getHighlights = async (req, res) => {
  try {
    const { id } = req.params;
    const { threshold = 20 } = req.query;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await getAuthorizedDocument(id, userId, req.user?.role);
    const text = document.extractedText || document.originalName;

    const highlights = await highlightSalientSentences(text, Number(threshold) || 20);

    return successResponse(
      res,
      highlights,
      'Salient sentences highlighted successfully'
    );
  } catch (error) {
    console.error('[documentAiController] getHighlights error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to compute sentence highlights',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Side-by-Side Document Comparison & Plagiarism Checker
 * POST /api/documents/compare
 */
export const compareDocuments = async (req, res) => {
  try {
    const { docIdA, docIdB, textA: customTextA, textB: customTextB } = req.body;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    let textA = customTextA || '';
    let textB = customTextB || '';
    let metaA = { id: docIdA, name: 'Document A' };
    let metaB = { id: docIdB, name: 'Document B' };

    if (docIdA) {
      const docA = await getAuthorizedDocument(docIdA, userId, req.user?.role);
      textA = docA.extractedText || docA.originalName;
      metaA = {
        id: docA._id,
        name: docA.originalName,
        pageCount: docA.pageCount,
        fileType: docA.fileType,
      };
    }

    if (docIdB) {
      const docB = await getAuthorizedDocument(docIdB, userId, req.user?.role);
      textB = docB.extractedText || docB.originalName;
      metaB = {
        id: docB._id,
        name: docB.originalName,
        pageCount: docB.pageCount,
        fileType: docB.fileType,
      };
    }

    if (!textA || !textB) {
      return errorResponse(
        res,
        'Both documents or text inputs are required for comparison',
        400
      );
    }

    const comparisonResult = await checkSimilarity(textA, textB);

    return successResponse(
      res,
      {
        docA: metaA,
        docB: metaB,
        ...comparisonResult,
      },
      'Document comparison and similarity calculation completed successfully'
    );
  } catch (error) {
    console.error('[documentAiController] compareDocuments error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to compare documents',
      error.statusCode || 500,
      error
    );
  }
};

export default {
  getOrGenerateSummary,
  getKeyInfo,
  getSentimentAndCategory,
  translateDocSummary,
  getMindMap,
  getStudyNotes,
  getCitations,
  getHighlights,
  compareDocuments,
};
