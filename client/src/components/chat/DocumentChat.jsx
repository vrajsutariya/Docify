import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  FileText,
  Files,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  BookOpen,
  X,
  HelpCircle,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { askDocumentQuestion } from '../../services/chatService';

export const DocumentChat = ({
  activeDoc,
  userDocs = [],
  onSelectDoc,
}) => {
  // Selected Document IDs for single or multi-doc chat
  const [selectedDocIds, setSelectedDocIds] = useState(
    activeDoc ? [activeDoc._id] : []
  );

  // Multi-document selector dropdown open state
  const [showDocSelector, setShowDocSelector] = useState(false);

  // Language state: 'en' | 'gu' | 'hi'
  const [language, setLanguage] = useState('en');

  // Chat messages: [{ id, sender: 'user' | 'assistant', text, citedPages, relevantChunks, confidence, timestamp }]
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Voice Speech-to-Text (STT) State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Text-to-Speech (TTS) State
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  // Interactive PDF Viewer & Citation Modal State
  const [activePdfModal, setActivePdfModal] = useState(null); // { pageNumber, totalPages, documentName, documentId, fileUrl, snippet, score, viewMode }

  // Copy feedback state
  const [copiedId, setCopiedId] = useState(null);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectorDropdownRef = useRef(null);

  // Synchronize when activeDoc prop changes from parent
  useEffect(() => {
    if (activeDoc?._id && !selectedDocIds.includes(activeDoc._id)) {
      setSelectedDocIds([activeDoc._id]);
    }
  }, [activeDoc?._id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        selectorDropdownRef.current &&
        !selectorDropdownRef.current.contains(e.target)
      ) {
        setShowDocSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Toggle document selection in multi-doc selector
  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) => {
      if (prev.includes(id)) {
        // Prevent unchecking the very last document
        if (prev.length === 1) return prev;
        return prev.filter((dId) => dId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select all or single
  const handleSelectAllDocs = () => {
    if (selectedDocIds.length === userDocs.length) {
      if (activeDoc?._id) setSelectedDocIds([activeDoc._id]);
    } else {
      setSelectedDocIds(userDocs.map((d) => d._id));
    }
  };

  // Suggested Starter Prompts
  const suggestedPrompts = {
    en: [
      'Summarize the key findings and conclusions',
      'What are the primary dates, deadlines, or timelines?',
      'Are there any financial metrics, costs, or numbers mentioned?',
      'What are the critical risks, penalties, or warnings?',
    ],
    gu: [
      'આ દસ્તાવેજના મુખ્ય તારણો અને સારાંશ જણાવો',
      'શું આમાં કોઈ નાણાકીય આંકડા અથવા ખર્ચનો ઉલ્લેખ છે?',
      'મહત્વપૂર્ણ તારીખો, સમયમર્યાદા અથવા શરતો કઈ છે?',
      'દસ્તાવેજમાં દર્શાવેલ મુખ્ય જોખમો અથવા ચેતવણીઓ શું છે?',
    ],
    hi: [
      'इस दस्तावेज़ के मुख्य निष्कर्ष और सारांश बताएं',
      'क्या इसमें कोई वित्तीय आंकड़े या लागत का उल्लेख है?',
      'महत्वपूर्ण तिथियां, समय-सीमा या शर्तें क्या हैं?',
      'दस्तावेज़ में उल्लिखित प्रमुख जोखिम या चेतावनियां क्या हैं?',
    ],
  };

  // Submit User Question
  const handleSendMessage = async (textToSend) => {
    const question = (textToSend || inputQuestion).trim();
    if (!question || isLoading) return;

    if (selectedDocIds.length === 0) {
      setErrorMessage('Please select at least one document to chat with.');
      return;
    }

    setErrorMessage(null);
    setInputQuestion('');

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await askDocumentQuestion(selectedDocIds, question, language);
      const data = response?.data || {};

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.answer || 'The document does not contain information to answer this question.',
        citedPages: data.citedPages || [],
        confidence: data.confidence || 0.85,
        relevantChunks: data.relevantChunks || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[DocumentChat] Chat error:', err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to generate response. Please try again.';

      setErrorMessage(errorMsg);
      const fallbackErrorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ ${errorMsg}`,
        citedPages: [],
        relevantChunks: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Speech-to-Text (Voice Input) Handler
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please try Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Set language according to active selection
      const langCodes = {
        en: 'en-US',
        gu: 'gu-IN',
        hi: 'hi-IN',
      };
      recognition.lang = langCodes[language] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('[DocumentChat] STT error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[DocumentChat] Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Read Aloud) Handler
  const toggleTTS = (msgId, text) => {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMsgId(msgId);

    // Strip citation brackets e.g. [Page 2] for cleaner audio reading
    const cleanSpeech = text
      .replace(/\[(?:Page\s*)?\d+(?:,\s*\d+)*\]/gi, '')
      .replace(/[*_#`]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    const langCodes = {
      en: 'en-US',
      gu: 'gu-IN',
      hi: 'hi-IN',
    };
    utterance.lang = langCodes[language] || 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Copy Message to Clipboard
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open PDF Viewer Modal and navigate to the requested page
  const handleOpenCitation = (pageNum, msg) => {
    // Normalize page number: enforce 1-based indexing
    const normalizedPage = Math.max(1, parseInt(pageNum, 10) || 1);

    // Find matching chunk from message.relevantChunks if available
    const matchedChunk = msg?.relevantChunks?.find(
      (c) => c.pageNumber === normalizedPage
    );

    // Identify target document (support multi-document RAG)
    let targetDoc = null;
    if (matchedChunk?.documentId) {
      targetDoc = userDocs.find((d) => String(d._id) === String(matchedChunk.documentId));
    }
    if (!targetDoc && activeDoc?._id) {
      targetDoc = activeDoc;
    }
    if (!targetDoc && selectedDocIds.length > 0) {
      targetDoc = userDocs.find((d) => selectedDocIds.includes(d._id));
    }
    if (!targetDoc && userDocs.length > 0) {
      targetDoc = userDocs[0];
    }

    const docName =
      matchedChunk?.documentName ||
      targetDoc?.originalName ||
      activeDoc?.originalName ||
      'Document';

    // Resolve full PDF URL
    const rawUrl =
      matchedChunk?.fileUrl ||
      targetDoc?.fileUrl ||
      activeDoc?.fileUrl ||
      '';

    const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const fullPdfUrl = rawUrl
      ? rawUrl.startsWith('http')
        ? rawUrl
        : `${apiOrigin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
      : '';

    const totalPages = Math.max(
      normalizedPage,
      targetDoc?.pageCount || activeDoc?.pageCount || 1
    );

    const snippetText =
      matchedChunk?.snippet ||
      matchedChunk?.text ||
      `Excerpt from Page ${normalizedPage} of ${docName}. Grounded source citation verified by Docify AI.`;

    setActivePdfModal({
      documentId: targetDoc?._id || matchedChunk?.documentId || activeDoc?._id,
      documentName: docName,
      fileUrl: fullPdfUrl,
      pageNumber: normalizedPage,
      totalPages,
      snippet: snippetText,
      score: matchedChunk?.score,
      viewMode: fullPdfUrl ? 'pdf' : 'snippet',
    });

    if (targetDoc && onSelectDoc) {
      onSelectDoc(targetDoc);
    }
  };

  // Navigate to previous, next, or specific page inside PDF Viewer
  const handleViewerPageChange = (newPage) => {
    if (!activePdfModal) return;
    const validatedPage = Math.max(1, Math.min(activePdfModal.totalPages, parseInt(newPage, 10) || 1));
    setActivePdfModal((prev) => ({
      ...prev,
      pageNumber: validatedPage,
    }));
  };

  // Render assistant message with clickable [Page X] badges inline
  const renderMessageContent = (msg) => {
    if (!msg.text) return null;
    if (msg.sender === 'user') return msg.text;

    const citationPattern = /(\[(?:Page|Pages)?\s*\d+(?:[,\s&and]+\d+)*\])/gi;
    const parts = msg.text.split(citationPattern);

    return parts.map((part, index) => {
      if (citationPattern.test(part)) {
        const numbers = (part.match(/\d+/g) || [])
          .map((n) => parseInt(n, 10))
          .filter((n) => !isNaN(n) && n > 0);

        if (numbers.length === 0) return <span key={index}>{part}</span>;

        return (
          <span key={index} className="inline-flex items-center gap-1 mx-0.5">
            {numbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleOpenCitation(num, msg)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold border transition-all cursor-pointer shadow-sm align-baseline bg-brand-red/10 dark:bg-brand-red/25 border-brand-red/30 text-brand-red dark:text-brand-redBright hover:bg-brand-red hover:text-white dark:hover:bg-brand-red dark:hover:text-white"
                title={`Open Page ${num} in PDF Viewer`}
              >
                <BookOpen className="w-2.5 h-2.5" />
                <span>[Page {num}]</span>
              </button>
            ))}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const isIndic = language === 'gu' || language === 'hi';

  return (
    <div className="flex flex-col h-[740px] rounded-2xl bg-light-surface/40 dark:bg-dark-surface/40 border border-light-border dark:border-dark-border overflow-hidden">
      {/* 1. TOP HEADER / CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shadow-glow-red shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading">
                Chat with Document (RAG)
              </h3>
              <Badge variant="brand" size="sm" className="text-[10px]">
                Grounding Active
              </Badge>
            </div>
            <p className="text-xs text-light-body dark:text-dark-body flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Answers strictly sourced from document with page citations
            </p>
          </div>
        </div>

        {/* Right Header Controls: Multi-Doc Selector, Language Toggle, Clear */}
        <div className="flex items-center gap-2">
          {/* Active Documents Dropdown */}
          <div className="relative" ref={selectorDropdownRef}>
            <button
              onClick={() => setShowDocSelector(!showDocSelector)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs font-semibold text-light-heading dark:text-dark-heading hover:border-brand-red/50 transition-colors"
            >
              <Files className="w-3.5 h-3.5 text-brand-orange" />
              <span>
                {selectedDocIds.length === 1
                  ? userDocs.find((d) => d._id === selectedDocIds[0])?.originalName?.slice(0, 18) || '1 Document'
                  : `${selectedDocIds.length} Documents Selected`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDocSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto p-2 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-xl z-30 space-y-1"
                >
                  <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-light-body dark:text-dark-body border-b border-light-border dark:border-dark-border mb-1">
                    <span>Select Documents to Query</span>
                    <button
                      onClick={handleSelectAllDocs}
                      className="text-brand-red dark:text-brand-redBright hover:underline"
                    >
                      {selectedDocIds.length === userDocs.length ? 'Reset' : 'Select All'}
                    </button>
                  </div>

                  {userDocs.length === 0 ? (
                    <p className="p-3 text-center text-xs text-light-body dark:text-dark-body">
                      No uploaded documents found.
                    </p>
                  ) : (
                    userDocs.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc._id);
                      return (
                        <label
                          key={doc._id}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-brand-red/10 dark:bg-brand-red/20 text-light-heading dark:text-dark-heading font-medium'
                              : 'hover:bg-light-bg dark:hover:bg-dark-bg text-light-body dark:text-dark-body'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDocSelection(doc._id)}
                            className="rounded border-light-border dark:border-dark-border text-brand-red focus:ring-brand-red w-4 h-4"
                          />
                          <FileText className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                          <span className="truncate flex-1" title={doc.originalName}>
                            {doc.originalName}
                          </span>
                        </label>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Multilingual Selector: EN / ગુ / हिં */}
          <div className="flex items-center p-1 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs font-semibold">
            {[
              { id: 'en', label: 'EN' },
              { id: 'gu', label: 'ગુ' },
              { id: 'hi', label: 'हिं' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  language === lang.id
                    ? 'bg-brand-gradient text-white shadow-sm'
                    : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Clear Chat History */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => {
                if (window.confirm('Clear current chat conversation?')) {
                  setMessages([]);
                }
              }}
              title="Clear Chat"
              className="text-xs px-2"
            />
          )}
        </div>
      </div>

      {/* 2. CHAT STREAM / MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-5 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red/10 to-brand-orange/10 border border-brand-red/20 flex items-center justify-center text-brand-red dark:text-brand-redBright shadow-glow-red">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-heading font-bold text-base sm:text-lg text-light-heading dark:text-dark-heading">
                {language === 'gu'
                  ? 'દસ્તાવેજ સાથે વાતચીત કરો (RAG એન્જિન)'
                  : language === 'hi'
                  ? 'दस्तावेज़ के साथ बातचीत करें (RAG इंजन)'
                  : 'Ask Questions Grounded in Your Documents'}
              </h4>
              <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
                {language === 'gu'
                  ? 'તમારા દસ્તાવેજમાંથી સીધા જવાબો મેળવો, જેમાં પેજ નંબર ટાંકવામાં આવશે.'
                  : language === 'hi'
                  ? 'अपने दस्तावेज़ से सीधे उत्तर प्राप्त करें, जिसमें पृष्ठ संख्या उद्धृत की जाएगी।'
                  : 'Docify AI answers strictly from your uploaded files and cites exact [Page X] references.'}
              </p>
            </div>

            {/* Quick Suggested Prompts */}
            <div className="w-full space-y-2 pt-2 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
                {language === 'gu' ? 'સૂચવેલા પ્રશ્નો:' : language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested Prompts:'}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {(suggestedPrompts[language] || suggestedPrompts.en).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs text-light-heading dark:text-dark-heading hover:border-brand-red/60 hover:bg-light-bg dark:hover:bg-dark-bg transition-all text-left group"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-brand-orange group-hover:scale-110 transition-transform shrink-0" />
                    <span className={`truncate ${isIndic ? 'indic-text' : ''}`}>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeakingThis = speakingMsgId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-sm space-y-2.5 ${
                    isUser
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-tr-none'
                      : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading rounded-tl-none'
                  }`}
                >
                  {/* Message Content */}
                  <div
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isIndic ? 'indic-text' : ''
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>

                  {/* Assistant Citations & Action Pills */}
                  {!isUser && (
                    <div className="pt-2 border-t border-light-border/60 dark:border-dark-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Source Page Citation Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {msg.citedPages && msg.citedPages.length > 0 ? (
                          <>
                            <span className="text-[11px] font-medium text-light-body dark:text-dark-body">
                              Sources:
                            </span>
                            {msg.citedPages.map((page) => (
                              <button
                                key={page}
                                onClick={() => handleOpenCitation(page, msg)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-red/10 dark:bg-brand-red/20 text-brand-red dark:text-brand-redBright hover:bg-brand-red hover:text-white dark:hover:bg-brand-red dark:hover:text-white transition-colors text-[11px] font-semibold border border-brand-red/20 cursor-pointer"
                                title={`Navigate to Page ${page} in PDF Viewer`}
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>[Page {page}]</span>
                              </button>
                            ))}
                          </>
                        ) : (
                          <span className="text-[10px] text-light-body dark:text-dark-body italic">
                            Grounding checked
                          </span>
                        )}
                      </div>

                      {/* Controls: Audio Read Aloud & Copy */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleTTS(msg.id, msg.text)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSpeakingThis
                              ? 'bg-status-error text-white'
                              : 'hover:bg-light-bg dark:hover:bg-dark-bg text-light-body dark:text-dark-body'
                          }`}
                          title={isSpeakingThis ? 'Stop Reading' : 'Read aloud (TTS)'}
                        >
                          {isSpeakingThis ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="p-1.5 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg text-light-body dark:text-dark-body transition-colors"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] text-right ${
                      isUser ? 'text-white/70' : 'text-light-body dark:text-dark-body'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center text-light-heading dark:text-dark-heading shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs text-light-body dark:text-dark-body flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-accent-light animate-bounce [animation-delay:0.4s]" />
              </span>
              <span>
                {language === 'gu'
                  ? 'દસ્તાવેજમાંથી માહિતી શોધી રહ્યાં છીએ...'
                  : language === 'hi'
                  ? 'दस्तावेज़ से जानकारी खोजी जा रही है...'
                  : 'Retrieving relevant excerpts and generating grounded answer...'}
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT BAR WITH STT, LANGUAGE & AUTO-RESIZE */}
      <div className="p-3 sm:p-4 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border shrink-0">
        {errorMessage && (
          <div className="mb-2 p-2 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-status-error text-white border-status-error animate-pulse shadow-glow-red'
                : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:text-brand-red hover:border-brand-red/40'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Voice input (Speech-to-Text)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              isListening
                ? (language === 'gu' ? 'સાંભળી રહ્યાં છીએ...' : language === 'hi' ? 'सुन रहे हैं...' : 'Listening to speech...')
                : language === 'gu'
                ? 'દસ્તાવેજ સંબંધિત તમારો પ્રશ્ન પૂછો...'
                : language === 'hi'
                ? 'दस्तावेज़ से संबंधित अपना प्रश्न पूछें...'
                : 'Ask a question about this document...'
            }
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs sm:text-sm text-light-heading dark:text-dark-heading placeholder:text-light-body/60 dark:placeholder:text-dark-body/60 focus:outline-none focus:border-brand-red/60 focus:ring-1 focus:ring-brand-red/60 transition-all ${
              isIndic ? 'indic-text' : ''
            }`}
          />

          {/* Send Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuestion.trim() || isLoading}
            isLoading={isLoading}
            leftIcon={Send}
            className="bg-brand-gradient shadow-glow-red px-4 text-xs sm:text-sm"
          >
            Ask
          </Button>
        </form>
      </div>

      {/* 4. MODAL: INTERACTIVE PDF VIEWER & GROUNDED SOURCE CITATION */}
      <AnimatePresence>
        {activePdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-5xl h-[90vh] rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header & Navigation Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shrink-0">
                {/* Document Title & Page Badge */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-brand-red/10 dark:bg-brand-red/20 text-brand-red dark:text-brand-redBright shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading truncate max-w-xs sm:max-w-md" title={activePdfModal.documentName}>
                      {activePdfModal.documentName}
                    </h4>
                    <p className="text-[11px] text-light-body dark:text-dark-body flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>RAG Grounded Citation</span>
                      <span>•</span>
                      <span className="font-semibold text-brand-red dark:text-brand-redBright">
                        Page {activePdfModal.pageNumber} of {activePdfModal.totalPages}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center gap-1.5 bg-light-bg dark:bg-dark-bg p-1 rounded-xl border border-light-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => handleViewerPageChange(activePdfModal.pageNumber - 1)}
                    disabled={activePdfModal.pageNumber <= 1}
                    className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-surface dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-2 text-xs font-semibold text-light-heading dark:text-dark-heading">
                    <span>Page</span>
                    <input
                      type="number"
                      min={1}
                      max={activePdfModal.totalPages}
                      value={activePdfModal.pageNumber}
                      onChange={(e) => handleViewerPageChange(e.target.value)}
                      className="w-12 text-center py-0.5 rounded bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs font-mono font-bold focus:outline-none focus:border-brand-red"
                    />
                    <span className="text-light-body dark:text-dark-body font-normal">/ {activePdfModal.totalPages}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewerPageChange(activePdfModal.pageNumber + 1)}
                    disabled={activePdfModal.pageNumber >= activePdfModal.totalPages}
                    className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-surface dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right Action Controls: Tab View, Open in Tab, Close */}
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center p-0.5 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs">
                    <button
                      type="button"
                      onClick={() => setActivePdfModal((prev) => ({ ...prev, viewMode: 'pdf' }))}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        activePdfModal.viewMode === 'pdf'
                          ? 'bg-brand-red text-white shadow-sm'
                          : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                      }`}
                    >
                      PDF View
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePdfModal((prev) => ({ ...prev, viewMode: 'snippet' }))}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        activePdfModal.viewMode === 'snippet'
                          ? 'bg-brand-red text-white shadow-sm'
                          : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                      }`}
                    >
                      Excerpt
                    </button>
                  </div>

                  {/* Open PDF in New Browser Tab */}
                  {activePdfModal.fileUrl && (
                    <a
                      href={`${activePdfModal.fileUrl}#page=${activePdfModal.pageNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-light-body hover:text-brand-red dark:text-dark-body dark:hover:text-brand-redBright hover:bg-light-bg dark:hover:bg-dark-bg border border-light-border dark:border-dark-border transition-colors"
                      title="Open full PDF in new browser tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {/* Close Modal Button */}
                  <button
                    type="button"
                    onClick={() => setActivePdfModal(null)}
                    className="p-2 rounded-xl text-light-body hover:text-light-heading dark:text-dark-body dark:hover:text-dark-heading hover:bg-light-bg dark:hover:bg-dark-bg border border-light-border dark:border-dark-border transition-colors"
                    title="Close PDF Viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body: PDF Viewer vs Grounded Text Excerpt */}
              <div className="flex-1 min-h-0 relative flex flex-col bg-zinc-900 overflow-hidden">
                {activePdfModal.viewMode === 'pdf' && activePdfModal.fileUrl ? (
                  <div className="flex-1 w-full h-full relative flex flex-col">
                    <iframe
                      key={`${activePdfModal.fileUrl}#page=${activePdfModal.pageNumber}`}
                      src={`${activePdfModal.fileUrl}#page=${activePdfModal.pageNumber}&view=FitH`}
                      className="w-full flex-1 border-none bg-white dark:bg-zinc-950"
                      title={`PDF Page Viewer - ${activePdfModal.documentName} Page ${activePdfModal.pageNumber}`}
                    />

                    {/* Bottom Grounded Snippet Drawer */}
                    {activePdfModal.snippet && (
                      <div className="p-3 bg-light-surface/95 dark:bg-dark-surface/95 border-t border-light-border dark:border-dark-border backdrop-blur-md shrink-0">
                        <div className="max-w-4xl mx-auto flex items-start gap-2.5">
                          <span className="p-1 rounded-md bg-brand-red/10 text-brand-red dark:text-brand-redBright shrink-0 mt-0.5">
                            <BookOpen className="w-3.5 h-3.5" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-light-heading dark:text-dark-heading block mb-0.5">
                              Verified Grounded Text Excerpt (Page {activePdfModal.pageNumber}):
                            </span>
                            <p className="text-xs text-light-body dark:text-dark-body line-clamp-2 leading-relaxed">
                              {activePdfModal.snippet}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-light-bg dark:bg-dark-bg">
                    <div className="max-w-3xl mx-auto space-y-4">
                      <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
                          <h5 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-brand-red" />
                            Grounded Excerpt from Page {activePdfModal.pageNumber}
                          </h5>
                          {activePdfModal.score && (
                            <Badge variant="brand" size="sm">
                              Score: {activePdfModal.score}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-light-body dark:text-dark-body leading-relaxed whitespace-pre-wrap font-sans">
                          {activePdfModal.snippet}
                        </p>
                      </div>

                      {activePdfModal.fileUrl && (
                        <div className="flex justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={BookOpen}
                            onClick={() => setActivePdfModal((prev) => ({ ...prev, viewMode: 'pdf' }))}
                            className="bg-brand-gradient shadow-glow-red"
                          >
                            Switch to Interactive PDF Page View
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentChat;
