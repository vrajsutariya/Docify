import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '../models/Document.js';
import { isGeminiConfigured } from './aiService.js';

/**
 * Splits each page's text into logical chunks of ~1200 characters with 150-character overlap,
 * preserving source page metadata and avoiding cutting words in half.
 *
 * @param {Array<{ pageNumber: number, text: string, chunks?: Array<{ chunkId: string, text: string }> }>} pages
 * @returns {Array<{ pageNumber: number, text: string, chunks: Array<{ chunkId: string, text: string }> }>}
 */
export const chunkDocument = (pages = []) => {
  if (!Array.isArray(pages)) return [];

  const CHUNK_SIZE = 1200; // ~300-400 words
  const OVERLAP = 150;     // ~40-50 words

  return pages.map((page, pIdx) => {
    const pageNum = page.pageNumber || pIdx + 1;
    const cleanText = (page.text || '').trim();

    if (!cleanText) {
      return {
        ...page,
        pageNumber: pageNum,
        text: '',
        chunks: [],
      };
    }

    // If text is smaller than chunk size, single chunk
    if (cleanText.length <= CHUNK_SIZE) {
      return {
        ...page,
        pageNumber: pageNum,
        chunks: [
          {
            chunkId: `${pageNum}_1`,
            text: cleanText,
          },
        ],
      };
    }

    const chunks = [];
    let startIndex = 0;
    let chunkSeq = 1;

    while (startIndex < cleanText.length) {
      let endIndex = Math.min(startIndex + CHUNK_SIZE, cleanText.length);

      // If we aren't at the end of the text, look for a clean break (sentence or whitespace)
      if (endIndex < cleanText.length) {
        // Look back up to 100 characters for a sentence or paragraph boundary
        const slice = cleanText.substring(startIndex, endIndex);
        const sentenceBreak = slice.search(/[.?!।\n]\s+(?=[A-Z0-9\u0900-\u097F\u0A80-\u0AFF])/g);

        if (sentenceBreak !== -1 && sentenceBreak > CHUNK_SIZE * 0.6) {
          endIndex = startIndex + sentenceBreak + 1;
        } else {
          // Fallback to last space within 80 chars
          const lastSpace = slice.lastIndexOf(' ');
          if (lastSpace > CHUNK_SIZE * 0.7) {
            endIndex = startIndex + lastSpace;
          }
        }
      }

      const chunkSlice = cleanText.substring(startIndex, endIndex).trim();
      if (chunkSlice.length > 0) {
        chunks.push({
          chunkId: `${pageNum}_${chunkSeq++}`,
          text: chunkSlice,
        });
      }

      if (endIndex >= cleanText.length) {
        break;
      }

      // Step forward with overlap
      startIndex = Math.max(startIndex + 1, endIndex - OVERLAP);
    }

    return {
      ...page,
      pageNumber: pageNum,
      chunks,
    };
  });
};

/**
 * Tokenizes text supporting English, Gujarati, and Hindi characters
 * @param {string} text
 * @returns {string[]}
 */
const tokenizeText = (text = '') => {
  if (!text) return [];
  // Match English words, numbers, and Indic character sequences
  const tokens = text
    .toLowerCase()
    .match(/[a-z0-9\u0900-\u097F\u0A80-\u0AFF]+/g) || [];
  
  // Basic stop words filter for English
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'with', 'by', 'as', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'what', 'who', 'how', 'when', 'where', 'why'
  ]);

  return tokens.filter((t) => t.length > 1 && !stopWords.has(t));
};

/**
 * Calculates BM25 / TF-IDF relevance score of a query against a document chunk
 * @param {string[]} queryTokens
 * @param {string} queryRaw
 * @param {string} chunkText
 * @param {number} avgDocLen
 * @param {Map<string, number>} idfMap
 * @returns {number}
 */
const calculateBM25Score = (queryTokens, queryRaw, chunkText, avgDocLen, idfMap) => {
  const chunkTokens = tokenizeText(chunkText);
  if (chunkTokens.length === 0 || queryTokens.length === 0) return 0;

  const k1 = 1.2;
  const b = 0.75;
  const docLen = chunkTokens.length;

  // Term frequency map in chunk
  const tfMap = new Map();
  for (const token of chunkTokens) {
    tfMap.set(token, (tfMap.get(token) || 0) + 1);
  }

  let score = 0;
  for (const token of queryTokens) {
    const tf = tfMap.get(token) || 0;
    if (tf > 0) {
      const idf = idfMap.get(token) || 1.0;
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + (b * docLen) / avgDocLen);
      score += idf * (numerator / denominator);
    }
  }

  // Exact phrase match bonus
  const cleanQ = queryRaw.trim().toLowerCase();
  if (cleanQ.length > 5 && chunkText.toLowerCase().includes(cleanQ)) {
    score += 5.0;
  }

  return score;
};

/**
 * Computes Cosine Similarity between two numerical vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Fetches vector embedding using Gemini API
 * @param {string} text
 * @returns {Promise<number[] | null>}
 */
const getGeminiEmbedding = async (text) => {
  if (!isGeminiConfigured()) return null;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
    // Try text-embedding-004 first, or fallback to embedding-001
    const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embedModel.embedContent(text.slice(0, 2048));
    return result?.embedding?.values || null;
  } catch (err) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
      const embedModel = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await embedModel.embedContent(text.slice(0, 2048));
      return result?.embedding?.values || null;
    } catch (err2) {
      console.warn('[ragService] Gemini embedding warning:', err2.message);
      return null;
    }
  }
};

/**
 * Finds top-k most relevant chunks across all selected document IDs
 * using vector embeddings (cosine similarity) with BM25 keyword scoring fallback/hybrid.
 *
 * @param {string} query
 * @param {string[]} documentIds
 * @param {number} [topK=4]
 * @returns {Promise<{ chunks: Array<{ chunkId: string, pageNumber: number, text: string, documentId: string, documentName: string, score: number }>, maxScore: number }>}
 */
export const findRelevantChunks = async (query, documentIds = [], topK = 4) => {
  if (!query || !documentIds || documentIds.length === 0) {
    return { chunks: [], maxScore: 0 };
  }

  // 1. Fetch all requested documents from database
  const docs = await Document.find({ _id: { $in: documentIds } }).lean();
  if (!docs || docs.length === 0) {
    return { chunks: [], maxScore: 0 };
  }

  // 2. Gather all chunks across documents, populating chunks if not yet generated
  const allChunks = [];
  const docsToUpdate = [];

  for (const doc of docs) {
    let pages = doc.pages || [];
    let needsUpdate = false;

    // Check if any page is missing chunks
    const hasChunks = pages.some((p) => Array.isArray(p.chunks) && p.chunks.length > 0);
    if (!hasChunks && pages.length > 0) {
      pages = chunkDocument(pages);
      needsUpdate = true;
      docsToUpdate.push({ id: doc._id, pages });
    }

    // Collect chunks with parent document metadata
    for (const page of pages) {
      const pageChunks = page.chunks || [];
      const pageNum = typeof page.pageNumber === 'number' && page.pageNumber > 0 ? page.pageNumber : 1;
      for (const ch of pageChunks) {
        allChunks.push({
          chunkId: ch.chunkId,
          pageNumber: pageNum,
          text: ch.text,
          documentId: doc._id.toString(),
          documentName: doc.originalName || 'Document',
          fileUrl: doc.fileUrl,
          fileType: doc.fileType,
          pageCount: doc.pageCount || pages.length || 1,
        });
      }
    }
  }

  // Asynchronously persist any newly generated chunks for future speed
  if (docsToUpdate.length > 0) {
    (async () => {
      for (const item of docsToUpdate) {
        await Document.findByIdAndUpdate(item.id, { pages: item.pages }).catch(() => {});
      }
    })();
  }

  if (allChunks.length === 0) {
    return { chunks: [], maxScore: 0 };
  }

  // 3. Compute relevance scores: Attempt Gemini Embedding first
  const queryTokens = tokenizeText(query);
  const totalChunks = allChunks.length;

  // Calculate BM25 IDF across all chunks
  const docFreq = new Map();
  let totalTokenCount = 0;
  for (const ch of allChunks) {
    const tokens = new Set(tokenizeText(ch.text));
    totalTokenCount += tokens.size;
    for (const t of tokens) {
      docFreq.set(t, (docFreq.get(t) || 0) + 1);
    }
  }
  const avgDocLen = Math.max(1, totalTokenCount / totalChunks);
  const idfMap = new Map();
  for (const [token, df] of docFreq.entries()) {
    // Standard Lucene/BM25 IDF formula
    const idf = Math.log(1 + (totalChunks - df + 0.5) / (df + 0.5));
    idfMap.set(token, Math.max(0.1, idf));
  }

  // Calculate BM25 score for every chunk
  allChunks.forEach((ch) => {
    ch.bm25Score = calculateBM25Score(queryTokens, query, ch.text, avgDocLen, idfMap);
  });

  // Check if we can use Gemini vector embeddings
  let usedEmbeddings = false;
  const queryVector = await getGeminiEmbedding(query);

  if (queryVector) {
    // Parallelize embedding of top candidates with Promise.all to ensure sub-second latency
    const sortedCandidates = [...allChunks].sort((a, b) => b.bm25Score - a.bm25Score).slice(0, 5);

    await Promise.all(
      sortedCandidates.map(async (cand) => {
        try {
          const candVector = await getGeminiEmbedding(cand.text);
          if (candVector) {
            cand.cosineScore = cosineSimilarity(queryVector, candVector);
            usedEmbeddings = true;
          }
        } catch {
          // Keep BM25 score on individual chunk failure
        }
      })
    );
  }

  // Combine scores:
  // If embeddings available: Hybrid score (0.7 * cosine + 0.3 * normalized BM25)
  // Else: BM25 score
  const maxBM25 = Math.max(...allChunks.map((c) => c.bm25Score || 0), 1);

  allChunks.forEach((ch) => {
    const normBM25 = (ch.bm25Score || 0) / maxBM25;
    if (ch.cosineScore !== undefined) {
      ch.score = 0.75 * ch.cosineScore + 0.25 * normBM25;
    } else {
      ch.score = normBM25;
    }
  });

  // Sort descending by final score
  allChunks.sort((a, b) => b.score - a.score);

  const topChunks = allChunks.slice(0, topK);
  const maxScore = topChunks.length > 0 ? topChunks[0].score : 0;

  return {
    chunks: topChunks,
    maxScore,
  };
};

/**
 * Extracts cited page numbers from AI text output (e.g., [Page 1], [Page 3], [Doc A, Page 2])
 * @param {string} text
 * @returns {number[]}
 */
export const extractCitedPages = (text = '') => {
  if (!text) return [];
  const cited = new Set();

  // Pattern matches: [Page 3], [page 3], [Page 3, Page 4], [Pages 1, 2], [Doc: X, Page 2]
  const regex = /\[(?:[^\]]*?Page|Pages)\s*([0-9,\s&and]+)\]/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const numbersInMatch = match[1].match(/\d+/g);
    if (numbersInMatch) {
      numbersInMatch.forEach((numStr) => {
        const n = parseInt(numStr, 10);
        if (!isNaN(n) && n > 0 && n < 10000) {
          cited.add(n);
        }
      });
    }
  }

  // Also check individual [Page X] tags directly
  const singleRegex = /\[Page\s*(\d+)\]/gi;
  while ((match = singleRegex.exec(text)) !== null) {
    const n = parseInt(match[1], 10);
    if (!isNaN(n)) cited.add(n);
  }

  return Array.from(cited).sort((a, b) => a - b);
};

/**
 * Fallback response generator when Gemini API is unconfigured or returns an error.
 * Strictly adheres to document context and ground-truth citations.
 *
 * @param {string} query
 * @param {Array<Object>} contextChunks
 * @param {'en' | 'gu' | 'hi'} language
 * @returns {{ answer: string, citedPages: number[] }}
 */
const generateFallbackRAGResponse = (query, contextChunks = [], language = 'en') => {
  const refusalResponses = {
    en: 'The document does not contain information to answer this question.',
    gu: 'આ પ્રશ્નનો જવાબ આપવા માટે દસ્તાવેજમાં કોઈ માહિતી ઉપલબ્ધ નથી.',
    hi: 'इस प्रश्न का उत्तर देने के लिए दस्तावेज़ में कोई जानकारी उपलब्ध नहीं है।',
  };

  if (!contextChunks || contextChunks.length === 0) {
    return {
      answer: refusalResponses[language] || refusalResponses.en,
      citedPages: [],
    };
  }

  // Check relevance of top chunk
  const topChunk = contextChunks[0];
  const queryTokens = tokenizeText(query);
  const matchingTokens = queryTokens.filter((t) =>
    topChunk.text.toLowerCase().includes(t.toLowerCase())
  );

  // If very low match, refuse strictly
  if (matchingTokens.length === 0 && (topChunk.score || 0) < 0.15) {
    return {
      answer: refusalResponses[language] || refusalResponses.en,
      citedPages: [],
    };
  }

  // Extract sentences containing query terms from top chunks
  const answerSentences = [];
  const citedPagesSet = new Set();

  for (const chunk of contextChunks.slice(0, 3)) {
    const sentences = chunk.text
      .split(/(?<=[.?!।\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    for (const sentence of sentences) {
      const matchCount = queryTokens.filter((t) =>
        sentence.toLowerCase().includes(t.toLowerCase())
      ).length;

      if (matchCount > 0) {
        answerSentences.push(`${sentence} [Page ${chunk.pageNumber}]`);
        citedPagesSet.add(chunk.pageNumber);
        if (answerSentences.length >= 4) break;
      }
    }
    if (answerSentences.length >= 4) break;
  }

  if (answerSentences.length === 0) {
    // If no direct sentence match, take the beginning of the top chunk
    const firstSentence = topChunk.text.split(/(?<=[.?!।\n])\s+/)[0] || topChunk.text.slice(0, 180);
    answerSentences.push(`${firstSentence.trim()} [Page ${topChunk.pageNumber}]`);
    citedPagesSet.add(topChunk.pageNumber);
  }

  let finalAnswer = answerSentences.join(' ');
  if (language === 'gu') {
    finalAnswer = `દસ્તાવેજના આધારે: ${finalAnswer}`;
  } else if (language === 'hi') {
    finalAnswer = `दस्तावेज़ के आधार पर: ${finalAnswer}`;
  }

  const citedPages = Array.from(citedPagesSet).sort((a, b) => a - b);

  return {
    answer: finalAnswer,
    citedPages,
  };
};

/**
 * Generates grounded RAG response with Gemini 1.5 Flash enforcing strict grounding and source page citations.
 *
 * @param {string} query
 * @param {Array<{ chunkId: string, pageNumber: number, text: string, documentId: string, documentName: string, score: number }>} contextChunks
 * @param {'en' | 'gu' | 'hi'} [language='en']
 * @returns {Promise<{ answer: string, citedPages: number[], confidence: number, relevantChunks: Array<Object> }>}
 */
/**
 * Generates ChatGPT-Grade Conversational RAG response with Gemini.
 * Features multi-turn conversation memory, educational exam mode (2M, 4M, 6M, 10M),
 * code formatting, natural multilingual reasoning (English, Gujarati, Hindi, Gujlish),
 * and exact source page citations [Page X].
 *
 * @param {string} query
 * @param {Array<{ chunkId: string, pageNumber: number, text: string, documentId: string, documentName: string, score: number }>} contextChunks
 * @param {'en' | 'gu' | 'hi'} [language='en']
 * @param {Array<{ role?: string, sender?: string, text?: string, content?: string }>} [conversationHistory=[]]
 * @returns {Promise<{ answer: string, citedPages: number[], confidence: number, relevantChunks: Array<Object>, followUpSuggestions: string[] }>}
 */
export const generateRAGResponse = async (
  query,
  contextChunks = [],
  language = 'en',
  conversationHistory = []
) => {
  // Assemble excerpts context if available
  const hasChunks = Array.isArray(contextChunks) && contextChunks.length > 0;
  const contextExcerpts = hasChunks
    ? contextChunks
        .map(
          (chunk, idx) =>
            `--- EXCERPT ${idx + 1} [Document: "${chunk.documentName}", Page ${chunk.pageNumber}] ---\n${chunk.text}`
        )
        .join('\n\n')
    : 'No direct document excerpts retrieved.';

  const languageInstructions = {
    en: 'Answer in clear, natural, student-friendly English. For technical concepts, explain step-by-step.',
    gu: 'Answer naturally and fluently in Gujarati (ગુજરાતી ભાષામાં). Preserve standard technical terms in English or in brackets (e.g., "MVC આર્કિટેક્ચર (Architecture)", "ડેટાબેઝ (Database)").',
    hi: 'Answer naturally and fluently in Hindi (हिन्दी भाषा में). Preserve standard technical terms in English or in brackets (e.g., "MVC आर्किटेक्चर (Architecture)", "डेटाबेस (Database)").',
  };

  const selectedLangInstruction = languageInstructions[language] || languageInstructions.en;

  const systemInstruction = `You are DocuMind AI, an intelligent, conversational university academic tutor and technical expert (comparable to ChatGPT educational mode).

CORE BEHAVIOR & CONVERSATIONAL INTELLIGENCE:
1. Natural & Conversational: Speak naturally, engagingly, and empathetically like an experienced university professor. Never output robotic canned templates or generic filler phrases like "I am an AI and as per the document".
2. Conversational Memory: You remember the ongoing conversation. Handle follow-up questions effortlessly (e.g. "explain its principles", "give an example", "SOA su che?"). Understand pronouns ("this", "that", "the above topic") within the conversation context without asking users to repeat themselves.
3. Document Grounding & Citations:
   - When answering questions about the uploaded document(s), prioritize document excerpts as the primary source of truth.
   - ALWAYS attach exact source page citation badges formatted as [Page X] (e.g. [Page 2] or [Page 4]) whenever referencing specific facts, definitions, or findings from the document.
4. University Exam Mastery:
   - If the user asks for answers tailored to marks (2 Marks, 4 Marks, 6 Marks, or 8-10 Marks), format the answer with suitable depth:
     - 2 Marks: Short, crisp formal definition and 2-3 high-yield bullet points.
     - 4 Marks: Introduction/definition, 4-5 structured explanatory points, and a concrete example.
     - 6 Marks: Structured university answer with Introduction, Definition, Detailed Steps/Features, Example/Flowchart, and Conclusion.
     - 8-10 Marks: Comprehensive master essay with full architecture, components, process breakdown, comparison table, advantages/disadvantages, real-world applications, and conclusion.
5. Technical, Code & Math Excellence:
   - For programming questions (React, Node.js, Express, MongoDB, SQL, Python, Java, C++, APIs), provide clean code blocks with syntax highlighting, clear step-by-step logic, and file placement guidance.
   - For mathematics or science, write formulas clearly formatted in KaTeX/LaTeX ($...$ or $$...$$) and explain each variable.
   - Use comparison tables when comparing two or more concepts.
6. Honest Boundary Handling:
   - If the user asks whether a specific detail is present in the document and it is absent, state honestly: "The uploaded document does not mention [topic]. However, from a general academic perspective..." and provide the educational answer.
7. Language: ${selectedLangInstruction} Also support informal mixed questions (like Gujlish: "SOA su che? Simple ma samjavo").`;

  // Build conversational turns for Gemini API
  const formattedContents = [];

  // Filter and format previous turns (last 8 turns for high relevance and low latency)
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recentTurns = conversationHistory.slice(-8);
    for (const turn of recentTurns) {
      const isUser = turn.role === 'user' || turn.sender === 'user';
      const text = (turn.text || turn.content || '').trim();
      if (!text) continue;

      formattedContents.push({
        role: isUser ? 'user' : 'model',
        parts: [{ text: text.slice(0, 2000) }],
      });
    }
  }

  // Current turn with Document Context + User Question
  const currentUserText = `[DOCUMENT CONTEXT EXCERPTS]:
${contextExcerpts}

[USER QUESTION]:
${query}

Please provide an articulate, high-quality, student-friendly response adhering to the guidelines above.`;

  formattedContents.push({
    role: 'user',
    parts: [{ text: currentUserText }],
  });

  // Attempt Gemini model generation
  if (isGeminiConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
      const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 3072, // Generous capacity for deep answers
        },
      });

      // Ensure proper alternating roles starting with 'user'
      const sanitizedContents = [];
      let expectedRole = 'user';
      for (const item of formattedContents) {
        if (item.role === expectedRole) {
          sanitizedContents.push(item);
          expectedRole = expectedRole === 'user' ? 'model' : 'user';
        }
      }
      // If the last item was not added because of role mismatch, ensure current query is included
      if (sanitizedContents.length === 0 || sanitizedContents[sanitizedContents.length - 1].role !== 'user') {
        sanitizedContents.push({
          role: 'user',
          parts: [{ text: currentUserText }],
        });
      }

      const response = await model.generateContent({
        contents: sanitizedContents,
      });

      const answerText = response?.response?.text()?.trim() || '';

      if (answerText) {
        let citedPages = extractCitedPages(answerText);

        // Attach citations if model referenced context but missed brackets
        if (citedPages.length === 0 && hasChunks && !answerText.toLowerCase().includes('does not contain')) {
          citedPages = [contextChunks[0].pageNumber];
        }

        const confidence = hasChunks
          ? Math.min(0.98, Math.max(0.78, contextChunks[0]?.score || 0.82))
          : 0.88;

        // Generate 3 contextual follow-up suggestions
        const followUpSuggestions = generateFollowUpSuggestions(query, answerText, language);

        return {
          answer: answerText,
          citedPages,
          confidence,
          relevantChunks: contextChunks.map((c) => ({
            chunkId: c.chunkId,
            pageNumber: c.pageNumber,
            documentId: c.documentId,
            documentName: c.documentName,
            fileUrl: c.fileUrl,
            fileType: c.fileType,
            pageCount: c.pageCount,
            snippet: (c.text || '').slice(0, 260),
            score: Number((c.score || 0).toFixed(3)),
          })),
          followUpSuggestions,
        };
      }
    } catch (apiError) {
      console.warn('[ragService] Gemini RAG generation error, invoking fallback:', apiError.message);
    }
  }

  // Fallback generation if Gemini unconfigured or failed
  const fallbackResult = generateFallbackRAGResponse(query, contextChunks, language);
  return {
    answer: fallbackResult.answer,
    citedPages: fallbackResult.citedPages,
    confidence: 0.75,
    relevantChunks: contextChunks.map((c) => ({
      chunkId: c.chunkId,
      pageNumber: c.pageNumber,
      documentId: c.documentId,
      documentName: c.documentName,
      fileUrl: c.fileUrl,
      fileType: c.fileType,
      pageCount: c.pageCount,
      snippet: (c.text || '').slice(0, 260),
      score: Number((c.score || 0).toFixed(3)),
    })),
    followUpSuggestions: generateFollowUpSuggestions(query, fallbackResult.answer, language),
  };
};

/**
 * Generates 3 intelligent, educational follow-up suggestions
 */
const generateFollowUpSuggestions = (query = '', answer = '', language = 'en') => {
  const isGu = language === 'gu';
  const isHi = language === 'hi';

  if (isGu) {
    return [
      'આ વિષયને વાસ્તવિક ઉદાહરણ સાથે સમજાવો',
      'પરીક્ષા માટે ૪ ગુણનો આદર્શ જવાબ આપો',
      'આના મુખ્ય ફાયદા અને ગેરફાયદા જણાવો',
    ];
  }

  if (isHi) {
    return [
      'इस विषय को वास्तविक उदाहरण के साथ समझाएं',
      'परीक्षा के लिए ४ अंक का आदर्श उत्तर दें',
      'इसके प्रमुख लाभ और हानियां बताएं',
    ];
  }

  // English default
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('code') || lowerQuery.includes('program') || lowerQuery.includes('syntax')) {
    return [
      'Show practical implementation code',
      'Explain error handling and edge cases',
      'What are the performance considerations?',
    ];
  }
  if (lowerQuery.includes('mark') || lowerQuery.includes('exam')) {
    return [
      'What are the most heavily tested exam questions on this?',
      'Provide a 6-mark answer with a diagram',
      'Compare this with related alternative concepts',
    ];
  }
  return [
    'Explain this in a 4-mark university exam format',
    'Give a real-world example and use case',
    'What are the key advantages and limitations?',
  ];
};

export default {
  chunkDocument,
  findRelevantChunks,
  generateRAGResponse,
  extractCitedPages,
};
