import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Clock,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  RefreshCw,
  Layers,
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Tag,
  ArrowLeft,
  FileUp,
  ChevronDown,
  ShieldAlert,
  Search,
  MessageSquare,
  HelpCircle,
  Trophy,
  Play,
  RotateCcw,
  Printer,
  Share2,
  GitBranch,
  GitCompare,
  BookMarked,
  Highlighter,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { DropZone } from '../../components/upload/DropZone';
import { DocumentChat } from '../../components/chat/DocumentChat';
import { QuizConfigModal } from '../../components/quiz/QuizConfigModal';
import { QuizCard } from '../../components/quiz/QuizCard';
import { ScoreBoard } from '../../components/quiz/ScoreBoard';
import { FlashcardDeck } from '../../components/flashcards/FlashcardDeck';
import { MindMapViewer } from '../../components/documind/MindMapViewer';
import { StudyNotesViewer } from '../../components/documind/StudyNotesViewer';
import { DocumentComparison } from '../../components/documind/DocumentComparison';
import { CitationsTable } from '../../components/documind/CitationsTable';
import { SalientHighlighter } from '../../components/documind/SalientHighlighter';
import {
  getDocumentById,
  getUserDocuments,
  formatBytes,
} from '../../services/documentService';
import {
  getSummary,
  getKeyInfo,
  getSentiment,
  translateSummary,
  getMindMap,
  getStudyNotes,
  getCitations,
  getHighlights,
  compareDocuments,
} from '../../services/documindService';
import {
  generateQuiz,
  getQuizzesByDocument,
  getQuizById,
  submitQuizAttempt,
} from '../../services/quizService';
import { useLanguage } from '../../context/LanguageContext';

export const DocuMindPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get('docId');
  const tabParam = searchParams.get('tab');

  // Documents list & selector state
  const [userDocs, setUserDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Active Tab: 'summary' | 'chat' | 'keyInfo' | 'sentiment' | 'translate'
  const [activeTab, setActiveTab] = useState(tabParam || 'summary');

  // Abstraction Depth: 'short' | 'medium' | 'detailed'
  const [abstractionDepth, setAbstractionDepth] = useState('short');

  // Active Summary Data
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Active Key Info Data
  const [keyInfoData, setKeyInfoData] = useState(null);
  const [loadingKeyInfo, setLoadingKeyInfo] = useState(false);

  // Active Sentiment Data
  const [sentimentData, setSentimentData] = useState(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);

  // Active Translation Data
  const [targetTranslationLang, setTargetTranslationLang] = useState('gu');
  const [translationResult, setTranslationResult] = useState(null);
  const [translating, setTranslating] = useState(false);

  // UI helpers
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Quiz & Flashcard state
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizStage, setQuizStage] = useState('list'); // 'list' | 'taking' | 'scoreboard'
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([]);
  const [quizAttemptResult, setQuizAttemptResult] = useState(null);
  const [showQuizConfigModal, setShowQuizConfigModal] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Citations & Highlights state
  const [citationsList, setCitationsList] = useState([]);
  const [loadingCitations, setLoadingCitations] = useState(false);
  const [highlightsData, setHighlightsData] = useState(null);
  const [loadingHighlights, setLoadingHighlights] = useState(false);

  // Citations fetcher
  const fetchCitationsData = useCallback(
    async (force = false) => {
      if (!docId) return;
      setLoadingCitations(true);
      try {
        const res = await getCitations(docId, force);
        setCitationsList(res?.data?.citations || []);
      } catch (err) {
        console.error('Error fetching citations:', err);
      } finally {
        setLoadingCitations(false);
      }
    },
    [docId]
  );

  // Highlights fetcher
  const fetchHighlightsData = useCallback(
    async (threshold = 20) => {
      if (!docId) return;
      setLoadingHighlights(true);
      try {
        const res = await getHighlights(docId, threshold);
        setHighlightsData(res?.data || null);
      } catch (err) {
        console.error('Error fetching highlights:', err);
      } finally {
        setLoadingHighlights(false);
      }
    },
    [docId]
  );

  // Lazy load citations or highlights when user switches to those tabs
  useEffect(() => {
    if (activeTab === 'citations' && docId && citationsList.length === 0) {
      fetchCitationsData();
    }
    if (activeTab === 'highlights' && docId && !highlightsData) {
      fetchHighlightsData(20);
    }
  }, [activeTab, docId, citationsList.length, highlightsData, fetchCitationsData, fetchHighlightsData]);

  // Load all user documents for the selector dropdown
  useEffect(() => {
    getUserDocuments({ limit: 50 })
      .then((res) => {
        const docs = res?.data?.documents || [];
        setUserDocs(docs);
        // If no docId in URL but user has documents, select the latest one automatically
        if (!docId && docs.length > 0) {
          setSearchParams({ docId: docs[0]._id });
        }
      })
      .catch((err) => console.error('Error fetching user documents:', err));
  }, [docId, setSearchParams]);

  // Load active document details when docId changes
  useEffect(() => {
    if (!docId) {
      setActiveDoc(null);
      setSummaryData(null);
      return;
    }

    setLoadingDoc(true);
    setErrorMessage(null);
    getDocumentById(docId)
      .then((res) => {
        setActiveDoc(res?.data || null);
      })
      .catch((err) => {
        console.error('Error loading document:', err);
        setErrorMessage('Unable to load document details.');
      })
      .finally(() => {
        setLoadingDoc(false);
      });
  }, [docId]);

  // Fetch or generate summary
  const fetchSummary = useCallback(
    async (forceRefresh = false) => {
      if (!docId) return;
      setLoadingSummary(true);
      setErrorMessage(null);
      try {
        const res = await getSummary(docId, 'all', 'en', forceRefresh);
        const data = res?.data || null;
        setSummaryData(data);
        if (data?.keyInfo) setKeyInfoData(data.keyInfo);
        if (data?.sentiment) {
          setSentimentData({
            sentiment: data.sentiment,
            category: data.category,
          });
        }
      } catch (err) {
        console.error('Error fetching summary:', err);
        setErrorMessage(err.message || 'Failed to generate 3-level abstraction summary.');
      } finally {
        setLoadingSummary(false);
      }
    },
    [docId]
  );

  // Fetch key info
  const fetchKeyInfo = useCallback(async () => {
    if (!docId) return;
    setLoadingKeyInfo(true);
    try {
      const res = await getKeyInfo(docId);
      setKeyInfoData(res?.data || null);
    } catch (err) {
      console.error('Error fetching key info:', err);
    } finally {
      setLoadingKeyInfo(false);
    }
  }, [docId]);

  // Fetch sentiment
  const fetchSentiment = useCallback(async () => {
    if (!docId) return;
    setLoadingSentiment(true);
    try {
      const res = await getSentiment(docId);
      setSentimentData(res?.data || null);
    } catch (err) {
      console.error('Error fetching sentiment:', err);
    } finally {
      setLoadingSentiment(false);
    }
  }, [docId]);

  // Trigger summary generation on initial document load
  useEffect(() => {
    if (activeDoc) {
      fetchSummary();
    }
  }, [activeDoc, fetchSummary]);

  // Fetch quizzes for active document
  const fetchDocumentQuizzes = useCallback(
    async (selectLatest = true) => {
      if (!docId) return;
      setLoadingQuizzes(true);
      try {
        const res = await getQuizzesByDocument(docId);
        const list = res?.data || [];
        setQuizzes(list);
        if (selectLatest && list.length > 0 && !activeQuiz) {
          const fullQuizRes = await getQuizById(list[0]._id);
          const fullQuiz = fullQuizRes?.data || fullQuizRes;
          setActiveQuiz(fullQuiz);
          setActiveQuizQuestions(fullQuiz.questions || []);
        }
      } catch (err) {
        console.warn('Error fetching document quizzes:', err);
      } finally {
        setLoadingQuizzes(false);
      }
    },
    [docId, activeQuiz]
  );

  useEffect(() => {
    if (docId) {
      fetchDocumentQuizzes(true);
    }
  }, [docId, fetchDocumentQuizzes]);

  // Handle Quiz Generation
  const handleGenerateQuizSubmit = async (config) => {
    if (!docId) return;
    setIsGeneratingQuiz(true);
    try {
      const res = await generateQuiz({
        documentId: docId,
        ...config,
      });
      const newQuiz = res?.data || res;
      setActiveQuiz(newQuiz);
      setActiveQuizQuestions(newQuiz.questions || []);
      setQuizStage('taking');
      setShowQuizConfigModal(false);
      setActiveTab('quiz');
      fetchDocumentQuizzes(false);
    } catch (err) {
      console.error('Quiz generation error:', err);
      alert(err?.response?.data?.message || 'Failed to generate quiz assessment.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Start taking a specific quiz from the list
  const handleStartQuiz = async (quizItem) => {
    try {
      const fullQuizRes = await getQuizById(quizItem._id);
      const fullQuiz = fullQuizRes?.data || fullQuizRes;
      setActiveQuiz(fullQuiz);
      setActiveQuizQuestions(fullQuiz.questions || []);
      setQuizStage('taking');
      setActiveTab('quiz');
    } catch (err) {
      console.error('Error starting quiz:', err);
    }
  };

  // Submit quiz attempt
  const handleQuizComplete = async ({ answers, timeTakenSeconds }) => {
    if (!activeQuiz) return;
    try {
      const res = await submitQuizAttempt(activeQuiz._id, {
        answers,
        timeTakenSeconds,
      });
      const data = res?.data || {};
      setQuizAttemptResult(data);
      setQuizStage('scoreboard');
      fetchDocumentQuizzes(false);
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
      let score = 0;
      const wrongQuestionIds = [];
      const topicStats = {};

      activeQuizQuestions.forEach((q) => {
        const userAns = (answers[q.id] || '').trim().toLowerCase();
        const correctAns = (q.correctAnswer || '').trim().toLowerCase();
        const isCorrect = userAns === correctAns;

        const topic = q.topic || 'General';
        if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
        topicStats[topic].total += 1;

        if (isCorrect) {
          score += 1;
          topicStats[topic].correct += 1;
        } else {
          wrongQuestionIds.push(q.id);
        }
      });

      const topicBreakdown = {};
      for (const [topic, stat] of Object.entries(topicStats)) {
        topicBreakdown[topic] = {
          total: stat.total,
          correct: stat.correct,
          percentage: Math.round((stat.correct / stat.total) * 100),
          isWeak: Math.round((stat.correct / stat.total) * 100) < 60,
        };
      }

      setQuizAttemptResult({
        score,
        total: activeQuizQuestions.length,
        timeTakenSeconds,
        wrongQuestionIds,
        topicBreakdown,
      });
      setQuizStage('scoreboard');
    }
  };

  // Retry Wrong Questions Only
  const handleRetryWrongOnly = () => {
    if (!activeQuiz || !quizAttemptResult?.wrongQuestionIds) return;
    const wrongQs = activeQuiz.questions.filter((q) =>
      quizAttemptResult.wrongQuestionIds.includes(q.id)
    );
    if (wrongQs.length > 0) {
      setActiveQuizQuestions(wrongQs);
      setQuizStage('taking');
    }
  };

  // Retake Full Quiz
  const handleRetakeFull = () => {
    if (!activeQuiz) return;
    setActiveQuizQuestions(activeQuiz.questions || []);
    setQuizStage('taking');
  };

  // Handle Tab Change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tab', tab);
      return p;
    });
    if (tab === 'keyInfo' && !keyInfoData) {
      fetchKeyInfo();
    } else if (tab === 'sentiment' && !sentimentData) {
      fetchSentiment();
    } else if ((tab === 'quiz' || tab === 'flashcards') && quizzes.length === 0) {
      fetchDocumentQuizzes(true);
    }
  };

  // Handle Translation
  const handleTranslate = async (lang = targetTranslationLang) => {
    if (!docId) return;
    setTranslating(true);
    setTargetTranslationLang(lang);
    try {
      const res = await translateSummary(docId, lang);
      setTranslationResult(res?.data || null);
    } catch (err) {
      console.error('Translation error:', err);
      setErrorMessage('Failed to translate summary.');
    } finally {
      setTranslating(false);
    }
  };

  // Active Summary Text depending on abstraction depth
  const activeSummaryText = useMemo(() => {
    if (!summaryData) return '';
    if (abstractionDepth === 'short') return summaryData.shortSummary || '';
    if (abstractionDepth === 'medium') {
      return (summaryData.mediumSummary || []).join('\n• ');
    }
    return summaryData.detailedSummary || '';
  }, [summaryData, abstractionDepth]);

  // Copy to clipboard
  const handleCopy = () => {
    const textToCopy =
      activeTab === 'translate' && translationResult
        ? `${translationResult.short}\n\n${(translationResult.medium || []).join('\n• ')}\n\n${translationResult.detailed}`
        : activeSummaryText || activeDoc?.extractedText || '';

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download content as Markdown or Text
  const handleDownload = (format = 'md') => {
    const title = activeDoc?.originalName ? activeDoc.originalName.replace(/\.[^/.]+$/, '') : 'documind-analysis';
    const content =
      `# ${activeDoc?.originalName || 'Document Analysis'}\n\n` +
      `**Generated by Docify DocuMind AI Engine**\n\n` +
      `## Short Summary\n${summaryData?.shortSummary || ''}\n\n` +
      `## Key Takeaways\n${(summaryData?.mediumSummary || []).map((m) => `- ${m}`).join('\n')}\n\n` +
      `## Detailed Breakdown\n${summaryData?.detailedSummary || ''}\n\n` +
      `## Sentiment & Domain\nTone: ${summaryData?.sentiment?.label || 'Neutral'} (${Math.round((summaryData?.sentiment?.score || 0.7) * 100)}%)\n` +
      `Category: ${summaryData?.category?.name || 'General'}\n`;

    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}-summary.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Text to Speech (TTS)
  const toggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = activeSummaryText || summaryData?.shortSummary || '';
    if (!textToRead) return;

    window.speechSynthesis.cancel(); // Stop any pending utterances
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Top Bar: Navigation & Document Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('nav.documind', 'DocuMind AI Workspace')}
            </h1>
            <Badge variant="brand" icon={Sparkles}>
              3-Level Abstraction
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
            Deep multi-tiered summarization, entity extraction, sentiment detection, and multilingual translation.
          </p>
        </div>

        {/* Document Switcher & Upload Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Document Selector Dropdown */}
          {userDocs.length > 0 && (
            <div className="relative">
              <select
                value={docId || ''}
                onChange={(e) => setSearchParams({ docId: e.target.value })}
                className="py-2 pl-3 pr-8 rounded-xl text-xs font-medium bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:border-brand-red dark:focus:border-brand-redBright max-w-xs truncate cursor-pointer shadow-sm"
              >
                {userDocs.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.originalName} ({formatBytes(d.fileSize)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={FileUp}
            onClick={() => setShowUploadModal(!showUploadModal)}
          >
            {showUploadModal ? 'Close Uploader' : 'Upload New'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </div>

      {/* Collapsible Upload Zone */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 border-dashed border-2 border-brand-red/40 bg-brand-red/5 dark:bg-brand-red/10">
              <DropZone
                onUploadSuccess={(newDoc) => {
                  setShowUploadModal(false);
                  setUserDocs((prev) => [newDoc, ...prev]);
                  setSearchParams({ docId: newDoc._id });
                }}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Active Info Header Banner */}
      {loadingDoc ? (
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton variant="avatar" className="w-12 h-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="title" className="w-1/3" />
              <Skeleton variant="text" className="w-1/4" />
            </div>
          </div>
        </Card>
      ) : activeDoc ? (
        <Card className="p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title & Metadata Badges */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <FileText className="w-5 h-5 text-brand-red dark:text-brand-redBright shrink-0" />
                <h2 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading truncate max-w-xl">
                  {activeDoc.originalName}
                </h2>
                <Badge variant="neutral" size="sm" className="uppercase font-mono text-[10px]">
                  {activeDoc.fileType}
                </Badge>
                {activeDoc.ocrProcessed && (
                  <Badge variant="brand" size="sm" icon={Sparkles} className="text-[10px]">
                    OCR Extracted
                  </Badge>
                )}
                {summaryData?.category?.name && (
                  <Badge variant="info" size="sm" className="text-[10px]">
                    {summaryData.category.name}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-light-body dark:text-dark-body">
                <span>{formatBytes(activeDoc.fileSize)}</span>
                <span>•</span>
                <span>{activeDoc.pageCount || 1} {activeDoc.pageCount === 1 ? 'page' : 'pages'}</span>
                <span>•</span>
                <span>{(activeDoc.wordCount || 0).toLocaleString()} words</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-orange" />
                  ~{activeDoc.readingTimeMinutes || 1} min read
                </span>
                {activeDoc.detectedLanguage && activeDoc.detectedLanguage !== 'unknown' && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-accent-dark dark:text-accent-light font-semibold uppercase">
                      Detected: {activeDoc.detectedLanguage}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Direct Language Switcher Quick Pill & Re-summarize */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs font-semibold">
                <button
                  onClick={() => {
                    handleTabChange('translate');
                    handleTranslate('en');
                  }}
                  className="px-2.5 py-1 rounded-lg hover:text-brand-red transition-colors"
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    handleTabChange('translate');
                    handleTranslate('gu');
                  }}
                  className="px-2.5 py-1 rounded-lg hover:text-brand-red transition-colors"
                >
                  ગુ
                </button>
                <button
                  onClick={() => {
                    handleTabChange('translate');
                    handleTranslate('hi');
                  }}
                  className="px-2.5 py-1 rounded-lg hover:text-brand-red transition-colors"
                >
                  हिं
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                isLoading={loadingSummary}
                onClick={() => fetchSummary(true)}
                title="Force Re-generate Summary"
              >
                Regenerate
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-light-body dark:text-dark-body mx-auto opacity-40" />
          <h3 className="font-heading text-lg font-bold text-light-heading dark:text-dark-heading">
            No Document Selected
          </h3>
          <p className="text-xs text-light-body dark:text-dark-body max-w-md mx-auto">
            Please select an existing document from the selector above or upload a new PDF, DOCX, TXT, or scanned image to start AI analysis.
          </p>
          <Button
            variant="primary"
            leftIcon={FileUp}
            onClick={() => setShowUploadModal(true)}
            className="bg-brand-gradient shadow-glow-cyan"
          >
            Upload Document Now
          </Button>
        </Card>
      )}

      {/* Main DocuMind Intelligence Interface */}
      {activeDoc && (
        <div className="space-y-6">
          {/* Tab Navigation: [Summary] | [Key Info] | [Chat] | [Quiz] | [Flashcards] | [Mind Map] | [Notes] | [Compare] | [Citations] | [Highlights] | [Sentiment] | [Translate] */}
          <div className="flex items-center gap-2 border-b border-light-border dark:border-dark-border overflow-x-auto pb-1">
            {[
              { id: 'summary', label: 'Summary', icon: Layers },
              { id: 'keyInfo', label: 'Key Info', icon: Tag },
              { id: 'chat', label: 'Chat (RAG)', icon: MessageSquare },
              { id: 'quiz', label: 'Quiz', icon: HelpCircle },
              { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
              { id: 'mindmap', label: 'Mind Map', icon: GitBranch },
              { id: 'notes', label: 'Exam Notes', icon: FileText },
              { id: 'compare', label: 'Compare & Plagiarism', icon: GitCompare },
              { id: 'citations', label: 'Citations', icon: BookMarked },
              { id: 'highlights', label: 'Highlights', icon: Highlighter },
              { id: 'sentiment', label: 'Sentiment', icon: Sparkles },
              { id: 'translate', label: 'Translate', icon: Languages },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-3 border-b-2 font-heading text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-brand-red text-brand-red dark:border-brand-redBright dark:text-brand-redBright'
                      : 'border-transparent text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:border-light-border dark:hover:border-dark-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Action Toolbar for Active Tab (Copy, Download, TTS) */}
          {!['chat', 'quiz', 'flashcards', 'mindmap', 'notes', 'compare', 'citations', 'highlights'].includes(activeTab) && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border">
              <span className="text-xs text-light-body dark:text-dark-body font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                Powered by Google Gemini Document Intelligence
              </span>

              <div className="flex items-center gap-2">
                {/* Text-to-Speech Button */}
                <Button
                  variant={isSpeaking ? 'danger' : 'outline'}
                  size="sm"
                  leftIcon={isSpeaking ? VolumeX : Volume2}
                  onClick={toggleTTS}
                  className="text-xs"
                >
                  {isSpeaking ? 'Stop Audio' : 'Listen (TTS)'}
                </Button>

                {/* Copy Button */}
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={copied ? Check : Copy}
                  onClick={handleCopy}
                  className="text-xs"
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>

                {/* Download Markdown */}
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={Download}
                  onClick={() => handleDownload('md')}
                  className="text-xs"
                >
                  Export .MD
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: CHAT WITH DOCUMENT (RAG) */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentChat
                activeDoc={activeDoc}
                userDocs={userDocs}
                onSelectDoc={(doc) => setSearchParams({ docId: doc._id })}
              />
            </motion.div>
          )}

          {/* TAB CONTENT: AI QUIZ GENERATOR & PLAYER */}
          {activeTab === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Quiz Stage: Taking Quiz */}
              {quizStage === 'taking' && activeQuiz && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={ArrowLeft}
                      onClick={() => setQuizStage('list')}
                    >
                      Exit Quiz
                    </Button>
                    <span className="text-xs text-light-body">
                      Assessment in progress
                    </span>
                  </div>
                  <QuizCard
                    questions={activeQuizQuestions}
                    quizTitle={activeQuiz.title}
                    language={activeQuiz.language}
                    onComplete={handleQuizComplete}
                  />
                </div>
              )}

              {/* Quiz Stage: Scoreboard */}
              {quizStage === 'scoreboard' && quizAttemptResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={ArrowLeft}
                      onClick={() => setQuizStage('list')}
                    >
                      Back to Assessments
                    </Button>
                  </div>
                  <ScoreBoard
                    score={quizAttemptResult.score}
                    total={quizAttemptResult.total}
                    timeTakenSeconds={quizAttemptResult.timeTakenSeconds}
                    wrongQuestionIds={quizAttemptResult.wrongQuestionIds}
                    topicBreakdown={quizAttemptResult.topicBreakdown}
                    shareId={activeQuiz?.shareId}
                    quizId={activeQuiz?._id}
                    onRetryWrongOnly={handleRetryWrongOnly}
                    onRetakeFull={handleRetakeFull}
                    onSwitchToFlashcards={() => setActiveTab('flashcards')}
                  />
                </div>
              )}

              {/* Quiz Stage: List / Dashboard */}
              {quizStage === 'list' && (
                <div className="space-y-6">
                  {/* Top Banner Card with Generate Button */}
                  <Card className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-br from-light-surface via-transparent to-brand-red/5 dark:from-dark-surface dark:to-brand-red/10 border-light-border dark:border-dark-border">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="sm">
                          Exam Assessment Engine
                        </Badge>
                        <span className="text-xs text-light-body">
                          {quizzes.length} {quizzes.length === 1 ? 'assessment' : 'assessments'} generated
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-light-heading dark:text-dark-heading">
                        Interactive AI Quiz & Diagnostic Exam
                      </h3>
                      <p className="text-xs sm:text-sm text-light-body max-w-xl">
                        Generate configurable exams (MCQ, True/False, Blanks, Short Answer) with immediate pedagogical feedback, countdown timer, and weak-topic diagnostics.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      leftIcon={Sparkles}
                      onClick={() => setShowQuizConfigModal(true)}
                      className="bg-brand-gradient shadow-glow-red shrink-0"
                    >
                      Generate New Quiz
                    </Button>
                  </Card>

                  {/* List of Existing Quizzes for Document */}
                  {loadingQuizzes ? (
                    <Card className="p-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
                        <span className="text-xs font-semibold">Loading document assessments...</span>
                      </div>
                    </Card>
                  ) : quizzes.length === 0 ? (
                    <Card className="p-10 text-center space-y-4">
                      <HelpCircle className="w-12 h-12 text-light-body mx-auto opacity-40" />
                      <h4 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                        No Assessments Created Yet
                      </h4>
                      <p className="text-xs text-light-body max-w-md mx-auto">
                        Test your comprehension of "{activeDoc.originalName}" with custom question counts, difficulty levels, and target languages.
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={Sparkles}
                        onClick={() => setShowQuizConfigModal(true)}
                        className="bg-brand-gradient shadow-glow-red"
                      >
                        Create First Quiz Now
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quizzes.map((quizItem) => (
                        <Card
                          key={quizItem._id}
                          className="p-5 space-y-4 hover:border-brand-red/40 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="brand" size="sm" className="capitalize text-[10px]">
                                {quizItem.difficulty}
                              </Badge>
                              <span className="font-mono text-[10px] uppercase font-bold text-light-body px-2 py-0.5 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                                {quizItem.language.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading truncate">
                              {quizItem.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-light-body">
                              <span>{quizItem.questionCount} Questions</span>
                              <span>&bull;</span>
                              <span>{quizItem.flashcardCount} Flashcards</span>
                              {quizItem.latestScore && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-emerald-500 font-bold font-mono">
                                    Last: {quizItem.latestScore}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={Play}
                              onClick={() => handleStartQuiz(quizItem)}
                              className="flex-1 bg-brand-gradient text-xs"
                            >
                              Take Quiz
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={Layers}
                              onClick={async () => {
                                const fullQuizRes = await getQuizById(quizItem._id);
                                setActiveQuiz(fullQuizRes?.data || fullQuizRes);
                                setActiveTab('flashcards');
                              }}
                              className="text-xs"
                            >
                              Flashcards
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT: 3D FLASHCARDS & SPACED REPETITION */}
          {activeTab === 'flashcards' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeQuiz && activeQuiz.flashcards?.length > 0 ? (
                <FlashcardDeck
                  quizId={activeQuiz._id}
                  initialFlashcards={activeQuiz.flashcards}
                  title={`${activeQuiz.title} - Leitner Deck`}
                  language={activeQuiz.language}
                  onFinishSession={() => setActiveTab('quiz')}
                />
              ) : (
                <Card className="p-10 text-center space-y-4 max-w-xl mx-auto">
                  <BookOpen className="w-12 h-12 text-light-body mx-auto opacity-40" />
                  <h4 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                    No Flashcard Deck Generated Yet
                  </h4>
                  <p className="text-xs text-light-body">
                    Generate an AI assessment to automatically extract key concepts into 3D flip cards with Leitner 3-box spaced repetition.
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={Sparkles}
                    onClick={() => setShowQuizConfigModal(true)}
                    className="bg-brand-gradient shadow-glow-red"
                  >
                    Generate Flashcards with AI
                  </Button>
                </Card>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT 1: 3-LEVEL ABSTRACTION SUMMARY */}
          {activeTab === 'summary' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* 3-Tier Segmented Depth Pill Toggle */}
              <div className="flex items-center justify-center">
                <div className="inline-flex p-1.5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm">
                  {[
                    { id: 'short', label: 'Short (2–3 Lines)', desc: 'High-level Overview' },
                    { id: 'medium', label: 'Medium (Key Takeaways)', desc: 'Executive Bullets' },
                    { id: 'detailed', label: 'Detailed (In-Depth)', desc: 'Full Breakdown' },
                  ].map((level) => {
                    const isSelected = abstractionDepth === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => setAbstractionDepth(level.id)}
                        className={`relative px-4 sm:px-6 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-glow-red scale-[1.02]'
                            : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:bg-light-bg/50 dark:hover:bg-dark-bg/50'
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary View Content Area */}
              {loadingSummary ? (
                <Card className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
                    <span className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                      Generating multi-level abstraction with Gemini AI...
                    </span>
                  </div>
                  <Skeleton variant="title" className="w-1/2" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-3/4" />
                </Card>
              ) : summaryData ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={abstractionDepth}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Level 1: Short Summary */}
                    {abstractionDepth === 'short' && (
                      <Card className="p-6 sm:p-8 space-y-4 border-l-4 border-l-brand-red dark:border-l-brand-redBright bg-gradient-to-br from-brand-red/5 via-transparent to-brand-orange/5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-lg font-bold text-light-heading dark:text-dark-heading flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-red dark:text-brand-redBright" />
                            Executive Overview
                          </h3>
                          <Badge variant="brand" size="sm">2–3 Sentences</Badge>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-light-heading dark:text-dark-heading font-medium indic-text">
                          {summaryData.shortSummary}
                        </p>
                      </Card>
                    )}

                    {/* Level 2: Medium Executive Bullets */}
                    {abstractionDepth === 'medium' && (
                      <Card className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                          <h3 className="font-heading text-lg font-bold text-light-heading dark:text-dark-heading flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Core Takeaways & Strategic Bullet Points
                          </h3>
                          <Badge variant="success" size="sm">
                            {summaryData.mediumSummary?.length || 0} Key Points
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {(summaryData.mediumSummary || []).map((bullet, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-start gap-3 hover:border-brand-red dark:hover:border-brand-redBright transition-colors"
                            >
                              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-red/10 text-brand-red dark:bg-brand-redBright/10 dark:text-brand-redBright font-mono font-bold text-xs shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm text-light-heading dark:text-dark-heading font-medium leading-relaxed indic-text">
                                {bullet}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Level 3: Detailed In-Depth Breakdown */}
                    {abstractionDepth === 'detailed' && (
                      <Card className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                          <h3 className="font-heading text-lg font-bold text-light-heading dark:text-dark-heading flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                            Comprehensive Section-by-Section Explanation
                          </h3>
                          <Badge variant="neutral" size="sm">Full Narrative</Badge>
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none text-light-heading dark:text-dark-heading leading-indic whitespace-pre-wrap font-sans text-xs sm:text-sm pt-2">
                          {summaryData.detailedSummary}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : null}
            </motion.div>
          )}

          {/* TAB CONTENT 2: KEY INFORMATION EXTRACTION */}
          {activeTab === 'keyInfo' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {loadingKeyInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-5 space-y-3">
                      <Skeleton variant="title" className="w-1/3" />
                      <div className="flex gap-2">
                        <Skeleton variant="rect" className="w-20 h-6 rounded-lg" />
                        <Skeleton variant="rect" className="w-24 h-6 rounded-lg" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : keyInfoData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* People */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-brand-red dark:text-brand-redBright">
                      <Users className="w-4 h-4" />
                      <h4 className="font-heading font-semibold text-sm">People & Stakeholders</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keyInfoData.people?.length > 0 ? (
                        keyInfoData.people.map((person, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-red/10 text-brand-red dark:bg-brand-redBright/15 dark:text-brand-redBright border border-brand-red/20"
                          >
                            {person}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-light-body dark:text-dark-body">No specific people detected.</span>
                      )}
                    </div>
                  </Card>

                  {/* Organizations */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-blue-500">
                      <Building2 className="w-4 h-4" />
                      <h4 className="font-heading font-semibold text-sm">Organizations & Companies</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keyInfoData.organizations?.length > 0 ? (
                        keyInfoData.organizations.map((org, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          >
                            {org}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-light-body dark:text-dark-body">No organizations detected.</span>
                      )}
                    </div>
                  </Card>

                  {/* Dates & Deadlines */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <Calendar className="w-4 h-4" />
                      <h4 className="font-heading font-semibold text-sm">Dates & Deadlines</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keyInfoData.dates?.length > 0 ? (
                        keyInfoData.dates.map((d, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          >
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-light-body dark:text-dark-body">No explicit dates detected.</span>
                      )}
                    </div>
                  </Card>

                  {/* Metrics & Financials */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-500">
                      <TrendingUp className="w-4 h-4" />
                      <h4 className="font-heading font-semibold text-sm">Metrics & Financials</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keyInfoData.metrics?.length > 0 ? (
                        keyInfoData.metrics.map((metric, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          >
                            {metric}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-light-body dark:text-dark-body">No financial or numerical metrics detected.</span>
                      )}
                    </div>
                  </Card>

                  {/* Keywords & Tags */}
                  <Card className="p-5 space-y-3 md:col-span-2">
                    <div className="flex items-center gap-2 text-cyan-500">
                      <Tag className="w-4 h-4" />
                      <h4 className="font-heading font-semibold text-sm">Keywords & Subject Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keyInfoData.keywords?.length > 0 ? (
                        keyInfoData.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:scale-105 transition-transform cursor-pointer"
                          >
                            #{kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-light-body dark:text-dark-body">No keywords extracted.</span>
                      )}
                    </div>
                  </Card>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* TAB CONTENT 3: SENTIMENT & CATEGORY DETECTION */}
          {activeTab === 'sentiment' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {loadingSentiment ? (
                <Card className="p-8 space-y-4">
                  <Skeleton variant="title" className="w-1/3" />
                  <Skeleton variant="rect" className="h-16 w-full rounded-xl" />
                </Card>
              ) : sentimentData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sentiment Card */}
                  <Card className="p-6 space-y-4 border-l-4 border-l-brand-orange bg-gradient-to-br from-brand-orange/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                        Tone & Sentiment Analysis
                      </h3>
                      {sentimentData.sentiment?.label === 'positive' ? (
                        <Badge variant="success" icon={CheckCircle2} size="md">
                          Positive
                        </Badge>
                      ) : sentimentData.sentiment?.label === 'negative' ? (
                        <Badge variant="error" icon={AlertTriangle} size="md">
                          Negative
                        </Badge>
                      ) : (
                        <Badge variant="warning" icon={Info} size="md">
                          Neutral
                        </Badge>
                      )}
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-light-body dark:text-dark-body">Confidence Score</span>
                        <span className="font-mono text-light-heading dark:text-dark-heading">
                          {Math.round((sentimentData.sentiment?.score || 0.75) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-light-border dark:bg-dark-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-red"
                          style={{
                            width: `${Math.round((sentimentData.sentiment?.score || 0.75) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-1">
                      <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                        Reasoning / Justification:
                      </p>
                      <p className="text-xs text-light-body dark:text-dark-body leading-relaxed">
                        {sentimentData.sentiment?.reason || 'The document maintains an objective and informative tone.'}
                      </p>
                    </div>
                  </Card>

                  {/* Domain Category Card */}
                  <Card className="p-6 space-y-4 border-l-4 border-l-accent bg-gradient-to-br from-accent/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                        Domain Classification
                      </h3>
                      <Badge variant="brand" size="md">
                        {sentimentData.category?.name || 'General'}
                      </Badge>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-light-body dark:text-dark-body">Category Confidence</span>
                        <span className="font-mono text-light-heading dark:text-dark-heading">
                          {Math.round((sentimentData.category?.confidence || 0.85) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-light-border dark:bg-dark-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
                          style={{
                            width: `${Math.round((sentimentData.category?.confidence || 0.85) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-2">
                      <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                        Detected Topic Attributes:
                      </p>
                      <p className="text-xs text-light-body dark:text-dark-body leading-relaxed">
                        Document content aligns with standard {sentimentData.category?.name || 'General'} conventions, terminology, and operational context.
                      </p>
                    </div>
                  </Card>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* TAB CONTENT 4: MULTILINGUAL TRANSLATION */}
          {activeTab === 'translate' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Language Selection Bar */}
              <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading flex items-center gap-2">
                    <Languages className="w-5 h-5 text-accent-dark dark:text-accent-light" />
                    Multilingual Document Intelligence (EN / ગુ / हिં)
                  </h3>
                  <p className="text-xs text-light-body dark:text-dark-body">
                    Translate structured abstraction into Gujarati or Hindi with full conjunct font rendering and line-height: 1.7.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={targetTranslationLang === 'gu' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleTranslate('gu')}
                    isLoading={translating && targetTranslationLang === 'gu'}
                    className={targetTranslationLang === 'gu' ? 'bg-brand-gradient shadow-glow-cyan' : ''}
                  >
                    ગુજરાતી (Gujarati)
                  </Button>
                  <Button
                    variant={targetTranslationLang === 'hi' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleTranslate('hi')}
                    isLoading={translating && targetTranslationLang === 'hi'}
                    className={targetTranslationLang === 'hi' ? 'bg-brand-gradient shadow-glow-cyan' : ''}
                  >
                    हिन्दी (Hindi)
                  </Button>
                  <Button
                    variant={targetTranslationLang === 'en' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleTranslate('en')}
                    isLoading={translating && targetTranslationLang === 'en'}
                  >
                    English
                  </Button>
                </div>
              </Card>

              {/* Translation Display */}
              {translating ? (
                <Card className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
                    <span className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                      Translating content with Gemini into {targetTranslationLang === 'gu' ? 'Gujarati' : targetTranslationLang === 'hi' ? 'Hindi' : 'English'}...
                    </span>
                  </div>
                  <Skeleton variant="title" className="w-1/2" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </Card>
              ) : translationResult ? (
                <div className="space-y-6">
                  {/* Translated Short */}
                  <Card className="p-6 space-y-3 border-l-4 border-l-brand-red dark:border-l-brand-redBright">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                        {targetTranslationLang === 'gu' ? 'ટૂંકો સારાંશ (Short Summary)' : targetTranslationLang === 'hi' ? 'संक्षिप्त सारांश (Short Summary)' : 'Short Summary'}
                      </h4>
                      <Badge variant="brand" size="sm">
                        {targetTranslationLang.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base leading-indic font-medium text-light-heading dark:text-dark-heading indic-text">
                      {translationResult.short}
                    </p>
                  </Card>

                  {/* Translated Bullets */}
                  {Array.isArray(translationResult.medium) && translationResult.medium.length > 0 && (
                    <Card className="p-6 space-y-4">
                      <h4 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                        {targetTranslationLang === 'gu' ? 'મુખ્ય મુદ્દાઓ (Key Takeaways)' : targetTranslationLang === 'hi' ? 'मुख्य बिंदु (Key Takeaways)' : 'Key Takeaways'}
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {translationResult.medium.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-start gap-3"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-red/10 text-brand-red font-mono font-bold text-xs shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm text-light-heading dark:text-dark-heading leading-indic indic-text">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Translated Detailed */}
                  {translationResult.detailed && (
                    <Card className="p-6 space-y-3">
                      <h4 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                        {targetTranslationLang === 'gu' ? 'વિગતવાર સમજૂતી (Detailed Breakdown)' : targetTranslationLang === 'hi' ? 'विस्तृत विश्लेषण (Detailed Breakdown)' : 'Detailed Breakdown'}
                      </h4>
                      <div className="text-xs sm:text-sm leading-indic whitespace-pre-wrap text-light-heading dark:text-dark-heading font-sans indic-text">
                        {translationResult.detailed}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="p-10 text-center rounded-2xl bg-light-surface/40 dark:bg-dark-surface/40 border border-dashed border-light-border dark:border-dark-border space-y-3">
                  <Languages className="w-10 h-10 text-accent-dark dark:text-accent-light mx-auto" />
                  <h4 className="font-heading font-semibold text-sm text-light-heading dark:text-dark-heading">
                    Ready for Multilingual Translation
                  </h4>
                  <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
                    Click Gujarati or Hindi above to generate instant multilingual summary versions with high grammatical fidelity.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT 5: VISUAL MIND MAP GENERATOR (Item 8) */}
          {activeTab === 'mindmap' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <MindMapViewer
                documentId={docId}
                documentTitle={activeDoc?.originalName}
                onFetchMindMap={getMindMap}
              />
            </motion.div>
          )}

          {/* TAB CONTENT 6: EXAM-READY STUDY NOTES (Item 9) */}
          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <StudyNotesViewer
                documentId={docId}
                documentTitle={activeDoc?.originalName}
                onFetchNotes={getStudyNotes}
              />
            </motion.div>
          )}

          {/* TAB CONTENT 7: SIDE-BY-SIDE COMPARE & PLAGIARISM CHECKER (Items 12 & 15) */}
          {activeTab === 'compare' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <DocumentComparison
                userDocuments={userDocs}
                activeDocId={docId}
                onCompare={compareDocuments}
              />
            </motion.div>
          )}

          {/* TAB CONTENT 8: CITATION & REFERENCE EXTRACTOR (Item 13) */}
          {activeTab === 'citations' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <CitationsTable
                citations={citationsList}
                loading={loadingCitations}
                onRefresh={() => fetchCitationsData(true)}
                documentTitle={activeDoc?.originalName}
              />
            </motion.div>
          )}

          {/* TAB CONTENT 9: IMPORTANT SENTENCES HIGHLIGHTER (Item 14) */}
          {activeTab === 'highlights' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <SalientHighlighter
                rawText={activeDoc?.extractedText || ''}
                salientSentences={highlightsData?.salientSentences || []}
                topPercent={highlightsData?.topPercent || 20}
                onThresholdChange={(th) => fetchHighlightsData(th)}
                loading={loadingHighlights}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Quiz Configuration Modal */}
      <QuizConfigModal
        isOpen={showQuizConfigModal}
        onClose={() => setShowQuizConfigModal(false)}
        onGenerate={handleGenerateQuizSubmit}
        documentTitle={activeDoc?.originalName}
        pageCount={activeDoc?.pageCount || 1}
        isLoading={isGeneratingQuiz}
      />
    </div>
  );
};

export default DocuMindPage;
