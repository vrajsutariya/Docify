import crypto from 'crypto';
import { Quiz } from '../models/Quiz.js';
import { Document } from '../models/Document.js';
import { generateQuiz } from '../services/quizService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';
import { logActivity, recordHistory } from '../services/loggerService.js';

/**
 * Parses user page range string (e.g. "1-5", "1, 3, 5") into an array of page numbers
 * @param {string} pageRange
 * @returns {number[]}
 */
const parsePageRange = (pageRange = '') => {
  if (!pageRange || typeof pageRange !== 'string') return [];
  const pages = new Set();
  const parts = pageRange.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
};

/**
 * Generate a new assessment quiz & flashcard deck for a document
 * POST /api/quizzes/generate
 */
export const createQuiz = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return errorResponse(res, 'Authentication required to generate quiz.', 401);
    }

    const {
      documentId,
      questionCount = 10,
      difficulty = 'medium',
      types = ['mcq', 'true_false', 'fill_in_the_blank', 'short_answer'],
      language = 'en',
      pageRange = '',
    } = req.body;

    if (!documentId) {
      return errorResponse(res, 'documentId is required.', 400);
    }

    // Verify document exists and belongs to user
    const document = await Document.findOne({ _id: documentId, userId });
    if (!document) {
      return errorResponse(res, 'Document not found or access denied.', 404);
    }

    // Prepare context text (sliced by pageRange if requested)
    let contextText = document.extractedText || '';
    const targetPages = parsePageRange(pageRange);

    if (targetPages.length > 0 && Array.isArray(document.pages) && document.pages.length > 0) {
      const filtered = document.pages.filter((p) => targetPages.includes(p.pageNumber));
      if (filtered.length > 0) {
        contextText = filtered
          .map((p) => `[Page ${p.pageNumber}]\n${p.text}`)
          .join('\n\n');
      }
    }

    if (!contextText.trim()) {
      return errorResponse(
        res,
        'No readable text could be retrieved for the selected document/page range.',
        400
      );
    }

    // Generate questions and flashcards via AI engine
    const quizData = await generateQuiz(contextText, {
      questionCount: parseInt(questionCount, 10) || 10,
      difficulty,
      types,
      language,
      documentTitle: document.originalName,
      pageRange,
    });

    // Generate unique share ID
    const shareId = `qz_${crypto.randomBytes(6).toString('hex')}`;

    const quiz = await Quiz.create({
      userId,
      documentId,
      title: quizData.title,
      language,
      difficulty,
      questions: quizData.questions,
      flashcards: quizData.flashcards,
      shareId,
      isPublic: true,
      attempts: [],
    });

    if (userId) {
      await logActivity({
        userId,
        userEmail: req.user?.email,
        action: 'QUIZ_GENERATED',
        module: 'documind',
        details: `Generated quiz "${quiz.title}" with ${quiz.questions.length} questions`,
      });

      await recordHistory({
        userId,
        itemType: 'quiz',
        itemId: quiz._id,
        title: quiz.title,
        summary: `${quiz.questions.length} questions (${quiz.difficulty})`,
        action: 'Interactive Knowledge Quiz',
        module: 'documind',
        metadata: {
          shareId: quiz.shareId,
          difficulty: quiz.difficulty,
          questionCount: quiz.questions.length,
        },
      });
    }

    return successResponse(res, quiz, 'Quiz and flashcards generated successfully', 201);
  } catch (error) {
    console.error('[quizController] Error creating quiz:', error);
    return errorResponse(
      res,
      error.message || 'Failed to generate quiz assessment.',
      500,
      error
    );
  }
};

/**
 * Retrieve quiz by ID
 * GET /api/quizzes/:id
 */
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const quiz = await Quiz.findById(id).populate('documentId', 'originalName fileType pageCount');
    if (!quiz) {
      return errorResponse(res, 'Quiz not found.', 404);
    }

    // Check authorization: must be creator or quiz is public
    if (quiz.userId.toString() !== userId?.toString() && !quiz.isPublic) {
      return errorResponse(res, 'Access denied to private quiz.', 403);
    }

    return successResponse(res, quiz, 'Quiz retrieved successfully');
  } catch (error) {
    console.error('[quizController] Error fetching quiz:', error);
    return errorResponse(res, 'Failed to fetch quiz.', 500, error);
  }
};

/**
 * Retrieve quiz by public share ID (No authentication required)
 * GET /api/quizzes/share/:shareId
 */
export const getQuizByShareId = async (req, res) => {
  try {
    const { shareId } = req.params;

    const quiz = await Quiz.findOne({ shareId }).populate('documentId', 'originalName fileType');
    if (!quiz) {
      return errorResponse(res, 'Shared quiz not found or expired.', 404);
    }

    // Sanitized response for public taker
    const publicQuiz = {
      _id: quiz._id,
      shareId: quiz.shareId,
      title: quiz.title,
      language: quiz.language,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      flashcardCount: quiz.flashcards.length,
      questions: quiz.questions,
      flashcards: quiz.flashcards,
      documentName: quiz.documentId?.originalName || 'Document',
      createdAt: quiz.createdAt,
    };

    return successResponse(res, publicQuiz, 'Shared quiz retrieved successfully');
  } catch (error) {
    console.error('[quizController] Error fetching shared quiz:', error);
    return errorResponse(res, 'Failed to retrieve shared quiz.', 500, error);
  }
};

/**
 * Submit quiz attempt with grading and weak-topic analysis
 * POST /api/quizzes/:id/attempt
 */
export const submitQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id || null;
    const { answers = {}, timeTakenSeconds = 0 } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return errorResponse(res, 'Quiz not found.', 404);
    }

    let score = 0;
    const total = quiz.questions.length;
    const wrongQuestionIds = [];
    const topicStats = {};

    const questionsWithResults = quiz.questions.map((q) => {
      const userAnswer = (answers[q.id] || '').trim();
      const correctAnswer = (q.correctAnswer || '').trim();

      // Normalize comparison
      const isCorrect =
        userAnswer.toLowerCase() === correctAnswer.toLowerCase() ||
        (q.type === 'fill_in_the_blank' &&
          correctAnswer.toLowerCase().includes(userAnswer.toLowerCase()) &&
          userAnswer.length >= 3);

      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0 };
      }
      topicStats[topic].total += 1;

      if (isCorrect) {
        score += 1;
        topicStats[topic].correct += 1;
      } else {
        wrongQuestionIds.push(q.id);
      }

      return {
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        userAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic,
        sourcePage: q.sourcePage,
        isCorrect,
      };
    });

    // Calculate percentage and weak-topic analysis
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const topicBreakdown = {};

    for (const [topic, stat] of Object.entries(topicStats)) {
      const topicPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      topicBreakdown[topic] = {
        total: stat.total,
        correct: stat.correct,
        percentage: topicPct,
        isWeak: topicPct < 60,
      };
    }

    // Persist attempt
    const attempt = {
      userId,
      score,
      total,
      timeTakenSeconds: Math.max(0, parseInt(timeTakenSeconds, 10) || 0),
      wrongQuestionIds,
      topicBreakdown,
      completedAt: new Date(),
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    return successResponse(
      res,
      {
        attemptId: quiz.attempts[quiz.attempts.length - 1]._id,
        score,
        total,
        percentage,
        timeTakenSeconds: attempt.timeTakenSeconds,
        wrongQuestionIds,
        topicBreakdown,
        questionsWithResults,
      },
      'Quiz attempt evaluated successfully'
    );
  } catch (error) {
    console.error('[quizController] Error submitting attempt:', error);
    return errorResponse(res, 'Failed to evaluate quiz attempt.', 500, error);
  }
};

/**
 * Update flashcard Leitner box level (1 = Frequent, 2 = Review, 3 = Mastered)
 * POST /api/quizzes/:id/flashcards/progress
 */
export const updateFlashcardProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardId, action } = req.body; // action: 'know' | 'dont_know'

    if (!cardId || !action) {
      return errorResponse(res, 'cardId and action are required.', 400);
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return errorResponse(res, 'Quiz not found.', 404);
    }

    const card = quiz.flashcards.find((fc) => fc.id === cardId);
    if (!card) {
      return errorResponse(res, 'Flashcard not found.', 404);
    }

    // Leitner 3-Box Algorithm:
    // If 'know': advance card to next box (max 3)
    // If 'dont_know': reset to Box 1 for frequent review
    if (action === 'know') {
      card.box = Math.min(3, (card.box || 1) + 1);
    } else {
      card.box = 1;
    }

    await quiz.save();

    // Box counts & mastery stats
    const totalCards = quiz.flashcards.length;
    const box1Count = quiz.flashcards.filter((c) => (c.box || 1) === 1).length;
    const box2Count = quiz.flashcards.filter((c) => c.box === 2).length;
    const box3Count = quiz.flashcards.filter((c) => c.box === 3).length;
    const masteryPercentage = totalCards > 0 ? Math.round((box3Count / totalCards) * 100) : 0;

    return successResponse(
      res,
      {
        cardId: card.id,
        box: card.box,
        stats: {
          totalCards,
          box1Count,
          box2Count,
          box3Count,
          masteryPercentage,
        },
        flashcards: quiz.flashcards,
      },
      'Flashcard progress updated'
    );
  } catch (error) {
    console.error('[quizController] Error updating flashcard:', error);
    return errorResponse(res, 'Failed to update flashcard progress.', 500, error);
  }
};

/**
 * Export quiz & answer key as printable HTML view or formatted text
 * GET /api/quizzes/:id/export
 */
export const exportQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeAnswers = 'true' } = req.query;
    const showAnswers = includeAnswers === 'true';

    const quiz = await Quiz.findById(id).populate('documentId', 'originalName');
    if (!quiz) {
      return errorResponse(res, 'Quiz not found.', 404);
    }

    const docName = quiz.documentId?.originalName || 'Document Assessment';

    // Build printable HTML sheet
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${quiz.title} - Docify Printable Quiz</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #1f2937; max-width: 800px; margin: 0 auto; }
    h1 { color: #dc2626; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 8px; }
    .meta { font-size: 13px; color: #6b7280; margin-bottom: 30px; }
    .q-box { margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; page-break-inside: avoid; }
    .q-title { font-weight: 600; margin-bottom: 8px; font-size: 15px; }
    .q-options { list-style-type: upper-alpha; padding-left: 24px; margin: 8px 0; }
    .q-options li { margin-bottom: 4px; }
    .answer-key { margin-top: 40px; padding-top: 20px; border-top: 2px dashed #9ca3af; page-break-before: always; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; background: #fee2e2; color: #dc2626; font-weight: 600; margin-left: 8px; }
    @media print { body { padding: 15px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print / Save as PDF</button>
  </div>
  <h1>${quiz.title}</h1>
  <div class="meta">
    Source Document: <strong>${docName}</strong> &bull; Total Questions: ${quiz.questions.length} &bull; Difficulty: ${quiz.difficulty.toUpperCase()} &bull; Language: ${quiz.language.toUpperCase()}
  </div>

  <div class="questions">
    ${quiz.questions
      .map(
        (q, idx) => `
      <div class="q-box">
        <div class="q-title">Q${idx + 1}. ${q.question} <span class="badge">${q.topic}</span></div>
        ${
          q.options && q.options.length > 0
            ? `<ol class="q-options">${q.options.map((opt) => `<li>${opt}</li>`).join('')}</ol>`
            : `<div style="height: 40px; border-bottom: 1px dotted #9ca3af; margin-top: 15px;"></div>`
        }
      </div>`
      )
      .join('')}
  </div>

  ${
    showAnswers
      ? `
  <div class="answer-key">
    <h2>Official Answer Key & Explanations</h2>
    ${quiz.questions
      .map(
        (q, idx) => `
      <div style="margin-bottom: 16px;">
        <strong>Q${idx + 1}:</strong> ${q.correctAnswer} <em>(Source: Page ${q.sourcePage})</em><br/>
        <span style="font-size: 13px; color: #4b5563;">&bull; <strong>Explanation:</strong> ${q.explanation}</span>
      </div>`
      )
      .join('')}
  </div>`
      : ''
  }
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('[quizController] Error exporting quiz:', error);
    return errorResponse(res, 'Failed to export quiz.', 500, error);
  }
};

/**
 * List all generated quizzes for a specific document
 * GET /api/quizzes/document/:docId
 */
export const getQuizzesByDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const quizzes = await Quiz.find({ documentId: docId, userId })
      .select('title language difficulty questions flashcards shareId attempts createdAt')
      .sort({ createdAt: -1 });

    const formatted = quizzes.map((q) => {
      const latestAttempt = q.attempts[q.attempts.length - 1];
      return {
        _id: q._id,
        title: q.title,
        language: q.language,
        difficulty: q.difficulty,
        questionCount: q.questions.length,
        flashcardCount: q.flashcards.length,
        shareId: q.shareId,
        attemptCount: q.attempts.length,
        latestScore: latestAttempt
          ? `${latestAttempt.score}/${latestAttempt.total} (${Math.round((latestAttempt.score / latestAttempt.total) * 100)}%)`
          : null,
        createdAt: q.createdAt,
      };
    });

    return successResponse(res, formatted, 'Document quizzes retrieved successfully');
  } catch (error) {
    console.error('[quizController] Error fetching document quizzes:', error);
    return errorResponse(res, 'Failed to fetch quizzes for document.', 500, error);
  }
};

export default {
  createQuiz,
  getQuizById,
  getQuizByShareId,
  submitQuizAttempt,
  updateFlashcardProgress,
  exportQuiz,
  getQuizzesByDocument,
};
