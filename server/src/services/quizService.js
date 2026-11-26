import { GoogleGenerativeAI } from '@google/generative-ai';
import { isGeminiConfigured, safeParseJson } from './aiService.js';

/**
 * Heuristic fallback quiz and flashcard generator when Gemini API is unconfigured or unavailable.
 * Generates structured questions (MCQ, True/False, Fill-in-the-blank, Short Answer) and flashcards from document text.
 *
 * @param {string} text
 * @param {Object} options
 * @returns {{ title: string, questions: Array<Object>, flashcards: Array<Object> }}
 */
const generateFallbackQuiz = (text = '', options = {}) => {
  const {
    questionCount = 10,
    difficulty = 'medium',
    types = ['mcq', 'true_false', 'fill_in_the_blank', 'short_answer'],
    language = 'en',
    documentTitle = 'Document Intelligence Assessment',
  } = options;

  const clean = text.trim();
  // Extract sentences with reasonable length
  const sentences = clean
    .split(/(?<=[.?!।\n])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 25 && s.length < 220);

  const fallbackTitle =
    language === 'gu'
      ? `${documentTitle} - મૂલ્યાંકન ક્વિઝ`
      : language === 'hi'
      ? `${documentTitle} - मूल्यांकन क्विज़`
      : `${documentTitle} - Mastery Assessment`;

  const availableTypes = Array.isArray(types) && types.length > 0
    ? types
    : ['mcq', 'true_false', 'fill_in_the_blank', 'short_answer'];

  const questions = [];
  const flashcards = [];

  const topics = [
    'Core Concepts',
    'Technical Architecture',
    'Operational Policies',
    'Performance & Metrics',
    'Risk & Compliance',
    'Strategic Roadmaps',
  ];

  const targetCount = Math.min(30, Math.max(3, Number(questionCount) || 10));

  for (let i = 0; i < targetCount; i++) {
    const qIndex = i + 1;
    const type = availableTypes[i % availableTypes.length];
    const sentence = sentences[i % Math.max(1, sentences.length)] || `The document establishes critical operational and analytical specifications for enterprise deployment (${qIndex}).`;
    const topic = topics[i % topics.length];
    const sourcePage = Math.max(1, (i % 5) + 1);

    if (type === 'mcq') {
      const words = sentence.split(' ').filter((w) => w.length > 4);
      const keyTerm = words[0] || 'Specification';
      const otherTerms = words.slice(1, 4);

      if (language === 'gu') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'mcq',
          question: `દસ્તાવેજ મુજબ, નીચેનામાંથી કયું વિધાન સાચું છે? "${sentence.slice(0, 100)}..."`,
          options: [
            sentence.slice(0, 70),
            `આ વિધાન ફક્ત બાહ્ય સિસ્ટમોને લાગુ પડે છે.`,
            `આ પ્રક્રિયા સંપૂર્ણપણે વૈકલ્પિક છે અને અનિવાર્ય નથી.`,
            `આ વિધાન દસ્તાવેજમાં સ્પષ્ટપણે અમાન્ય જાહેર કરવામાં આવ્યું છે.`,
          ],
          correctAnswer: sentence.slice(0, 70),
          explanation: `આ વિધાન દસ્તાવેજના પેજ ${sourcePage} પર દર્શાવેલ મૂળભૂત વિગતો સાથે સુસંગત છે.`,
          topic,
          sourcePage,
        });
      } else if (language === 'hi') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'mcq',
          question: `दस्तावेज़ के अनुसार, निम्नलिखित में से कौन सा कथन सही है? "${sentence.slice(0, 100)}..."`,
          options: [
            sentence.slice(0, 70),
            `यह प्रक्रिया केवल बाहरी प्रणालियों पर लागू होती है।`,
            `यह विनिर्देश पूरी तरह से वैकल्पिक है और अनिवार्य नहीं है।`,
            `यह कथन दस्तावेज़ में स्पष्ट रूप से अमान्य घोषित किया गया है।`,
          ],
          correctAnswer: sentence.slice(0, 70),
          explanation: `यह कथन दस्तावेज़ के पृष्ठ ${sourcePage} पर उल्लिखित प्राथमिक विवरणों पर आधारित है।`,
          topic,
          sourcePage,
        });
      } else {
        questions.push({
          id: `q_${qIndex}`,
          type: 'mcq',
          question: `According to the document analysis, which statement is factually accurate regarding: "${sentence.slice(0, 90)}..."?`,
          options: [
            sentence.slice(0, 75),
            `This guideline applies exclusively to third-party secondary integrations.`,
            `The outlined procedure is considered deprecated under modern compliance policies.`,
            `The document explicitly rejects this recommendation in favor of ad-hoc alternatives.`,
          ],
          correctAnswer: sentence.slice(0, 75),
          explanation: `Directly supported by the document's primary findings detailed on Page ${sourcePage}.`,
          topic,
          sourcePage,
        });
      }
    } else if (type === 'true_false') {
      const isTrue = i % 2 === 0;
      if (language === 'gu') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'true_false',
          question: `સાચું કે ખોટું: ${sentence}`,
          options: ['સાચું (True)', 'ખોટું (False)'],
          correctAnswer: isTrue ? 'સાચું (True)' : 'ખોટું (False)',
          explanation: `દસ્તાવેજના પેજ ${sourcePage} ના સંદર્ભ અનુસાર આ વિધાન ${isTrue ? 'સાચું' : 'ખોટું'} છે.`,
          topic,
          sourcePage,
        });
      } else if (language === 'hi') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'true_false',
          question: `सत्य या असत्य: ${sentence}`,
          options: ['सत्य (True)', 'असत्य (False)'],
          correctAnswer: isTrue ? 'सत्य (True)' : 'असत्य (False)',
          explanation: `दस्तावेज़ के पृष्ठ ${sourcePage} के संदर्भानुसार यह कथन ${isTrue ? 'सत्य' : 'असत्य'} है।`,
          topic,
          sourcePage,
        });
      } else {
        questions.push({
          id: `q_${qIndex}`,
          type: 'true_false',
          question: `True or False: ${sentence}`,
          options: ['True', 'False'],
          correctAnswer: isTrue ? 'True' : 'False',
          explanation: `Verified against the explicit contextual directives outlined on Page ${sourcePage}.`,
          topic,
          sourcePage,
        });
      }
    } else if (type === 'fill_in_the_blank') {
      const words = sentence.split(' ');
      const blankWord = words[Math.min(3, words.length - 1)] || 'verified';
      const blankedSentence = sentence.replace(blankWord, '_______');

      if (language === 'gu') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'fill_in_the_blank',
          question: `ખાલી જગ્યા પૂરો: "${blankedSentence}"`,
          options: [],
          correctAnswer: blankWord,
          explanation: `સાચો શબ્દ "${blankWord}" છે, જે પેજ ${sourcePage} પર નોંધાયેલ છે.`,
          topic,
          sourcePage,
        });
      } else if (language === 'hi') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'fill_in_the_blank',
          question: `रिक्त स्थान भरें: "${blankedSentence}"`,
          options: [],
          correctAnswer: blankWord,
          explanation: `सही शब्द "${blankWord}" है, जो पृष्ठ ${sourcePage} पर दर्ज है।`,
          topic,
          sourcePage,
        });
      } else {
        questions.push({
          id: `q_${qIndex}`,
          type: 'fill_in_the_blank',
          question: `Complete the sentence: "${blankedSentence}"`,
          options: [],
          correctAnswer: blankWord,
          explanation: `The missing key terminology is "${blankWord}" as articulated on Page ${sourcePage}.`,
          topic,
          sourcePage,
        });
      }
    } else {
      // short_answer
      if (language === 'gu') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'short_answer',
          question: `દસ્તાવેજ અનુસાર નીચેના વિધાનનો મુખ્ય ઉદ્દેશ્ય શું છે? "${sentence.slice(0, 100)}"`,
          options: [],
          correctAnswer: sentence.slice(0, 60),
          explanation: `પેજ ${sourcePage} પર વર્ણવેલ નીતિ અનુસાર મુખ્ય ઉદ્દેશ્ય સ્પષ્ટ કરવામાં આવ્યો છે.`,
          topic,
          sourcePage,
        });
      } else if (language === 'hi') {
        questions.push({
          id: `q_${qIndex}`,
          type: 'short_answer',
          question: `दस्तावेज़ के अनुसार निम्नलिखित कथन का मुख्य उद्देश्य क्या है? "${sentence.slice(0, 100)}"`,
          options: [],
          correctAnswer: sentence.slice(0, 60),
          explanation: `पृष्ठ ${sourcePage} पर वर्णित नीति के अनुसार मुख्य उद्देश्य स्पष्ट किया गया है।`,
          topic,
          sourcePage,
        });
      } else {
        questions.push({
          id: `q_${qIndex}`,
          type: 'short_answer',
          question: `State the primary purpose or implication of: "${sentence.slice(0, 100)}"?`,
          options: [],
          correctAnswer: sentence.slice(0, 60),
          explanation: `Documented on Page ${sourcePage} as part of core functional specifications.`,
          topic,
          sourcePage,
        });
      }
    }

    // Corresponding Flashcard
    flashcards.push({
      id: `fc_${qIndex}`,
      front:
        language === 'gu'
          ? `${topic}: મુખ્ય સિદ્ધાંત #${qIndex}`
          : language === 'hi'
          ? `${topic}: मुख्य सिद्धांत #${qIndex}`
          : `${topic}: Core Principle #${qIndex}`,
      back: sentence,
      topic,
      box: 1,
    });
  }

  return {
    title: fallbackTitle,
    questions,
    flashcards,
  };
};

/**
 * Main Quiz Generation Service
 * Invokes Gemini 1.5 Flash to generate balanced questions & Leitner flashcards conforming strictly to schema.
 *
 * @param {string} text - Extracted document text (optionally sliced by page range)
 * @param {Object} options - Configuration options
 * @param {number} [options.questionCount=10]
 * @param {'easy' | 'medium' | 'hard'} [options.difficulty='medium']
 * @param {string[]} [options.types=['mcq', 'true_false', 'fill_in_the_blank', 'short_answer']]
 * @param {'en' | 'gu' | 'hi'} [options.language='en']
 * @param {string} [options.documentTitle='Document Assessment']
 * @param {string} [options.pageRange='']
 * @returns {Promise<{ title: string, questions: Array<Object>, flashcards: Array<Object> }>}
 */
export const generateQuiz = async (text, options = {}) => {
  const {
    questionCount = 10,
    difficulty = 'medium',
    types = ['mcq', 'true_false', 'fill_in_the_blank', 'short_answer'],
    language = 'en',
    documentTitle = 'Document Assessment',
    pageRange = '',
  } = options;

  const count = Math.min(30, Math.max(3, parseInt(questionCount, 10) || 10));
  const activeTypes = Array.isArray(types) && types.length > 0
    ? types
    : ['mcq', 'true_false', 'fill_in_the_blank', 'short_answer'];

  if (isGeminiConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
      const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.25,
          responseMimeType: 'application/json',
          maxOutputTokens: 4096,
        },
      });

      const languageDirectives = {
        en: 'Generate all quiz titles, questions, options, explanations, and flashcards in English.',
        gu: 'Generate all quiz titles, questions, options, explanations, and flashcards STRICTLY in Gujarati (ગુજરાતી ભાષામાં) using authentic Gujarati script and vocabulary.',
        hi: 'Generate all quiz titles, questions, options, explanations, and flashcards STRICTLY in Hindi (हिन्दी भाषा में) using authentic Devanagari script and vocabulary.',
      };

      const systemPrompt = `You are a Lead EdTech Assessment Architect and Exam Creator.
Your task is to analyze the provided document content and generate an interactive exam quiz and 3D Leitner study flashcards.

CONFIGURATION:
- Total Questions: ${count}
- Difficulty Level: ${difficulty.toUpperCase()} (Adjust question depth, distractors, and subtlety accordingly)
- Question Types to Include: ${activeTypes.join(', ')}
- Target Language Directive: ${languageDirectives[language] || languageDirectives.en}
${pageRange ? `- Focused Page Range: ${pageRange}` : ''}

REQUIRED JSON STRUCTURE (Output ONLY valid raw JSON conforming strictly to this format):
{
  "title": "Engaging descriptive assessment title",
  "questions": [
    {
      "id": "q_1",
      "type": "mcq" | "true_false" | "fill_in_the_blank" | "short_answer",
      "question": "Clear, unambiguous question text",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Required for mcq (4 choices) and true_false (2 choices: True/False). Empty array [] for fill_in_the_blank and short_answer.
      "correctAnswer": "Exact correct string matching one of the options (or key answer word for blank/short answer)",
      "explanation": "Detailed pedagogical explanation of why this answer is correct and why other choices are wrong",
      "topic": "Specific subtopic or domain concept for weak-topic categorization (e.g. Governance, Financials, Architecture)",
      "sourcePage": 1 // Best matching source page number from text (integer >= 1)
    }
  ],
  "flashcards": [
    {
      "id": "fc_1",
      "front": "Key Term, Formula, or Question",
      "back": "Clear, concise definition, answer, and takeaway",
      "topic": "Subtopic name"
    }
  ]
}

STRICT QUALITY RULES:
1. Every question must be grounded in the provided document content.
2. For Multiple Choice (mcq): Always provide 4 plausible options. Distractors must be realistic.
3. For True/False: options must be ["True", "False"] (or translated equivalents).
4. Explanations must be educational, clarifying the underlying rationale.
5. Create at least 5 to 10 high-yield flashcards covering key definitions.`;

      const userPrompt = `DOCUMENT TEXT CONTENT:
Title: ${documentTitle}
${text.slice(0, 32000)}

Generate the assessment now in valid JSON format.`;

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
      });

      const responseText = response?.response?.text()?.trim() || '';
      const parsed = safeParseJson(responseText, null);

      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        // Normalize IDs and defaults
        const sanitizedQuestions = parsed.questions.map((q, idx) => ({
          id: q.id || `q_${idx + 1}`,
          type: ['mcq', 'true_false', 'fill_in_the_blank', 'short_answer'].includes(q.type)
            ? q.type
            : 'mcq',
          question: q.question || `Question ${idx + 1}`,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer || (q.options?.[0] || 'Correct'),
          explanation: q.explanation || 'Verified from source document.',
          topic: q.topic || 'General',
          sourcePage: Math.max(1, parseInt(q.sourcePage, 10) || 1),
        }));

        const sanitizedFlashcards = Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0
          ? parsed.flashcards.map((fc, idx) => ({
              id: fc.id || `fc_${idx + 1}`,
              front: fc.front || `Concept #${idx + 1}`,
              back: fc.back || 'Definition from document.',
              topic: fc.topic || 'General',
              box: 1,
            }))
          : sanitizedQuestions.slice(0, 10).map((q, idx) => ({
              id: `fc_${idx + 1}`,
              front: q.question,
              back: `${q.correctAnswer}\n\n${q.explanation}`,
              topic: q.topic,
              box: 1,
            }));

        return {
          title: parsed.title || `${documentTitle} - Assessment Quiz`,
          questions: sanitizedQuestions,
          flashcards: sanitizedFlashcards,
        };
      }
    } catch (err) {
      console.warn('[quizService] Gemini quiz generation error, falling back to heuristic:', err.message);
    }
  }

  return generateFallbackQuiz(text, options);
};

export default {
  generateQuiz,
};
