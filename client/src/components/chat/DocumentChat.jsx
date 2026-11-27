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
  Square,
  RotateCcw,
  Edit2,
  Award,
  GraduationCap,
  Lightbulb,
  Code,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DocifyLogo } from '../common/DocifyLogo';
import { askDocumentQuestion } from '../../services/chatService';

/**
 * Format markdown text into ChatGPT-style rich elements with inline citation badges and copyable code blocks
 */
const renderChatMarkdown = (text, onOpenCitation, msg) => {
  if (!text) return null;

  // Split content into blocks: code blocks vs standard text blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'text',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    blocks.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // Helper to render text with bold, bullet points, headings, and [Page X] badges
  const renderFormattedParagraph = (para, pIdx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Headings
    if (trimmed.startsWith('####')) {
      return (
        <h5 key={pIdx} className="font-heading font-bold text-xs sm:text-sm text-brand-orange mt-2 mb-1">
          {renderInlineElements(trimmed.replace(/^####\s*/, ''), onOpenCitation, msg)}
        </h5>
      );
    }
    if (trimmed.startsWith('###')) {
      return (
        <h4 key={pIdx} className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading mt-3 mb-1.5 border-b border-light-border/40 dark:border-dark-border/40 pb-1">
          {renderInlineElements(trimmed.replace(/^###\s*/, ''), onOpenCitation, msg)}
        </h4>
      );
    }
    if (trimmed.startsWith('##')) {
      return (
        <h3 key={pIdx} className="font-heading font-bold text-base text-brand-red dark:text-brand-redBright mt-3 mb-1.5">
          {renderInlineElements(trimmed.replace(/^##\s*/, ''), onOpenCitation, msg)}
        </h3>
      );
    }

    // Bullet points
    if (/^[*-]\s+/.test(trimmed)) {
      const items = trimmed.split(/\n[*-]\s+/);
      return (
        <ul key={pIdx} className="space-y-1.5 my-2 pl-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-light-body dark:text-dark-body">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />
              <div className="flex-1">
                {renderInlineElements(item.replace(/^[*-]\s+/, ''), onOpenCitation, msg)}
              </div>
            </li>
          ))}
        </ul>
      );
    }

    // Numbered lists
    if (/^[0-9]+\.\s+/.test(trimmed)) {
      const items = trimmed.split(/\n(?=[0-9]+\.\s+)/);
      return (
        <ol key={pIdx} className="space-y-1.5 my-2 pl-2">
          {items.map((item, i) => {
            const numMatch = item.match(/^([0-9]+)\.\s+/);
            const num = numMatch ? numMatch[1] : i + 1;
            const body = item.replace(/^[0-9]+\.\s+/, '');
            return (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-light-body dark:text-dark-body">
                <span className="text-[11px] font-bold text-brand-red dark:text-brand-redBright font-mono shrink-0 mt-0.5">
                  {num}.
                </span>
                <div className="flex-1">
                  {renderInlineElements(body, onOpenCitation, msg)}
                </div>
              </li>
            );
          })}
        </ol>
      );
    }

    // Standard paragraph
    return (
      <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-light-body dark:text-dark-body my-1.5">
        {renderInlineElements(trimmed, onOpenCitation, msg)}
      </p>
    );
  };

  return blocks.map((block, bIdx) => {
    if (block.type === 'code') {
      return <ChatCodeBlock key={bIdx} language={block.language} code={block.code} />;
    }

    // Split text into paragraphs
    const paragraphs = block.content.split(/\n\s*\n/);
    return (
      <div key={bIdx} className="space-y-1.5">
        {paragraphs.map((p, pIdx) => renderFormattedParagraph(p, pIdx))}
      </div>
    );
  });
};

/**
 * Renders inline bold, inline code, and clickable [Page X] citation badges
 */
const renderInlineElements = (text, onOpenCitation, msg) => {
  if (!text) return null;

  // Pattern matching citations e.g. [Page 2], [Page 2, 4], [Pages 5]
  const citationPattern = /(\[(?:Page|Pages)?\s*\d+(?:[,\s&and]+\d+)*\])/gi;
  const parts = text.split(citationPattern);

  return parts.map((part, index) => {
    if (citationPattern.test(part)) {
      const numbers = (part.match(/\d+/g) || [])
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n) && n > 0);

      if (numbers.length === 0) return <span key={index}>{part}</span>;

      return (
        <span key={index} className="inline-flex items-center gap-1 mx-0.5 align-baseline">
          {numbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onOpenCitation?.(num, msg)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold border transition-all cursor-pointer shadow-xs bg-brand-red/10 dark:bg-brand-red/25 border-brand-red/30 text-brand-red dark:text-brand-redBright hover:bg-brand-red hover:text-white dark:hover:bg-brand-red dark:hover:text-white"
              title={`Open Page ${num} in PDF Viewer`}
            >
              <BookOpen className="w-2.5 h-2.5" />
              <span>[Page {num}]</span>
            </button>
          ))}
        </span>
      );
    }

    // Bold formatting (**term**)
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={bIdx} className="font-bold text-light-heading dark:text-dark-heading">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return <span key={bIdx}>{bPart}</span>;
    });
  });
};

/**
 * Code Block Component with Language Tag and Copy Button
 */
const ChatCodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-zinc-900 text-zinc-100 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-950/80 border-b border-zinc-800 text-[11px] text-zinc-400">
        <span className="font-mono uppercase font-semibold text-brand-orange">{language}</span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const DocumentChat = ({
  activeDoc,
  userDocs = [],
  onSelectDoc,
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState(activeDoc ? [activeDoc._id] : []);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Voice Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Text-to-Speech State
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  // Interactive PDF Viewer Modal State
  const [activePdfModal, setActivePdfModal] = useState(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState(null);

  // AbortController for stopping generation
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectorDropdownRef = useRef(null);

  // Sync when activeDoc changes
  useEffect(() => {
    if (activeDoc?._id && !selectedDocIds.includes(activeDoc._id)) {
      setSelectedDocIds([activeDoc._id]);
    }
  }, [activeDoc?._id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorDropdownRef.current && !selectorDropdownRef.current.contains(e.target)) {
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((dId) => dId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllDocs = () => {
    if (selectedDocIds.length === userDocs.length) {
      if (activeDoc?._id) setSelectedDocIds([activeDoc._id]);
    } else {
      setSelectedDocIds(userDocs.map((d) => d._id));
    }
  };

  // Quick Action Pills
  const quickActionPills = [
    { label: '2 Marks Answer', prompt: 'Provide a crisp 2-mark university exam answer with a formal definition and 2 key points.' },
    { label: '4 Marks Answer', prompt: 'Provide a structured 4-mark university exam answer with definition, explanation, and example.' },
    { label: '6 Marks Answer', prompt: 'Provide a comprehensive 6-mark university exam answer with introduction, mechanism, diagram, and conclusion.' },
    { label: '10 Marks Answer', prompt: 'Provide an exhaustive 8-10 mark masterclass answer with full architecture, steps, pros/cons, diagram, and practical use cases.' },
    { label: 'Code Example', prompt: 'Provide a clean, runnable code example with step-by-step logic and file placement.' },
    { label: 'Compare Concepts', prompt: 'Create a clear comparison table contrasting the core concepts discussed in this document.' },
  ];

  // Submit User Question with Full Conversation History
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

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Format conversation history for backend
    const conversationHistory = updatedMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      text: m.text,
    }));

    try {
      abortControllerRef.current = new AbortController();

      const response = await askDocumentQuestion(
        selectedDocIds,
        question,
        language,
        conversationHistory
      );
      const data = response?.data || {};

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.answer || 'The document does not contain information to answer this question.',
        citedPages: data.citedPages || [],
        confidence: data.confidence || 0.85,
        relevantChunks: data.relevantChunks || [],
        followUpSuggestions: data.followUpSuggestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        console.log('[DocumentChat] Generation stopped by user.');
        return;
      }
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
      abortControllerRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Stop Generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (isLoading || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      // Remove last assistant response and re-send
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[copy.length - 1]?.sender === 'assistant') copy.pop();
        return copy;
      });
      handleSendMessage(lastUserMsg.text);
    }
  };

  // Edit Message
  const handleEditMessage = (text) => {
    setInputQuestion(text);
    inputRef.current?.focus();
  };

  // STT Voice Input
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const langCodes = { en: 'en-US', gu: 'gu-IN', hi: 'hi-IN' };
      recognition.lang = langCodes[language] || 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[DocumentChat] Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  // TTS Read Aloud
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

    const cleanSpeech = text
      .replace(/\[(?:Page\s*)?\d+(?:,\s*\d+)*\]/gi, '')
      .replace(/[*_#`]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    const langCodes = { en: 'en-US', gu: 'gu-IN', hi: 'hi-IN' };
    utterance.lang = langCodes[language] || 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Copy Message
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Citation Modal Opener
  const handleOpenCitation = (pageNum, msg) => {
    const normalizedPage = Math.max(1, parseInt(pageNum, 10) || 1);
    const matchedChunk = msg?.relevantChunks?.find((c) => c.pageNumber === normalizedPage);

    let targetDoc = null;
    if (matchedChunk?.documentId) {
      targetDoc = userDocs.find((d) => String(d._id) === String(matchedChunk.documentId));
    }
    if (!targetDoc && activeDoc?._id) targetDoc = activeDoc;
    if (!targetDoc && selectedDocIds.length > 0) {
      targetDoc = userDocs.find((d) => selectedDocIds.includes(d._id));
    }
    if (!targetDoc && userDocs.length > 0) targetDoc = userDocs[0];

    const docName =
      matchedChunk?.documentName ||
      targetDoc?.originalName ||
      activeDoc?.originalName ||
      'Document';

    let rawFileUrl = matchedChunk?.fileUrl || targetDoc?.fileUrl || activeDoc?.fileUrl;
    let fullPdfUrl = '';
    if (rawFileUrl) {
      fullPdfUrl = rawFileUrl.startsWith('http')
        ? rawFileUrl
        : `http://localhost:5000${rawFileUrl}`;
    }

    const totalPages =
      matchedChunk?.pageCount ||
      targetDoc?.pageCount ||
      activeDoc?.pageCount ||
      normalizedPage;

    const snippetText =
      matchedChunk?.snippet ||
      `Source reference extracted from Page ${normalizedPage} of "${docName}".`;

    setActivePdfModal({
      documentName: docName,
      documentId: matchedChunk?.documentId || targetDoc?._id,
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

  const handleViewerPageChange = (newPage) => {
    if (!activePdfModal) return;
    const validatedPage = Math.max(1, Math.min(activePdfModal.totalPages, parseInt(newPage, 10) || 1));
    setActivePdfModal((prev) => ({
      ...prev,
      pageNumber: validatedPage,
    }));
  };

  const isIndic = language === 'gu' || language === 'hi';

  return (
    <div className="flex flex-col h-[750px] rounded-2xl bg-light-surface/40 dark:bg-dark-surface/40 border border-light-border dark:border-dark-border overflow-hidden shadow-soft">
      {/* 1. TOP HEADER / CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shadow-glow-red shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading flex items-center gap-2">
              <span>DocuMind Conversational AI</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ChatGPT Mode
              </span>
            </h3>
            <p className="text-[11px] text-light-body dark:text-dark-body">
              Multi-turn memory • Grounded [Page X] citations • University exam answers
            </p>
          </div>
        </div>

        {/* Right Controls: Multi-doc selector, Language toggle, Clear */}
        <div className="flex items-center gap-2">
          {/* Multi-Doc Selector Dropdown */}
          <div className="relative" ref={selectorDropdownRef}>
            <button
              type="button"
              onClick={() => setShowDocSelector(!showDocSelector)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-xs font-semibold text-light-heading dark:text-dark-heading hover:border-brand-orange transition-all"
            >
              <Files className="w-3.5 h-3.5 text-brand-orange" />
              <span>
                {selectedDocIds.length === 1
                  ? userDocs.find((d) => d._id === selectedDocIds[0])?.originalName?.slice(0, 18) || '1 Document'
                  : `${selectedDocIds.length} Documents Selected`}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDocSelector && (
              <div className="absolute right-0 top-full mt-2 w-72 max-h-72 overflow-y-auto p-2 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-xl z-30 space-y-1">
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-light-border dark:border-dark-border px-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-light-body dark:text-dark-body">
                    Select Context Docs
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllDocs}
                    className="text-[11px] font-semibold text-brand-orange hover:underline"
                  >
                    {selectedDocIds.length === userDocs.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {userDocs.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc._id);
                  return (
                    <div
                      key={doc._id}
                      onClick={() => toggleDocSelection(doc._id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-brand-red/10 text-brand-red dark:text-brand-redBright font-semibold'
                          : 'text-light-body dark:text-dark-body hover:bg-light-bg dark:hover:bg-dark-bg'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-brand-red focus:ring-brand-red"
                      />
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1">{doc.originalName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs">
            {[
              { code: 'en', label: 'EN' },
              { code: 'gu', label: 'ગુજ' },
              { code: 'hi', label: 'हिन्' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  language === lang.code
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Clear Chat */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Clear conversation history?')) {
                  setMessages([]);
                }
              }}
              title="Clear Conversation"
              className="text-xs px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. CHAT STREAM / MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-5 py-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red/10 to-brand-orange/10 border border-brand-red/20 flex items-center justify-center text-brand-red dark:text-brand-redBright shadow-glow-red">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-heading font-bold text-base sm:text-lg text-light-heading dark:text-dark-heading">
                {language === 'gu'
                  ? 'દસ્તાવેજ સાથે બુદ્ધિશાળી સંવાદ (ChatGPT Intelligence)'
                  : language === 'hi'
                  ? 'दस्तावेज़ के साथ बुद्धिमान बातचीत (ChatGPT Intelligence)'
                  : 'Ask Anything Grounded in Your Documents'}
              </h4>
              <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
                {language === 'gu'
                  ? 'પરીક્ષા જવાબો, કોડિંગ ઉદાહરણો અને ચોક્કસ [Page X] સંદર્ભ સાથે કુદરતી વાતચીત કરો.'
                  : language === 'hi'
                  ? 'परीक्षा उत्तर, कोडिंग उदाहरण और सटीक [Page X] संदर्भ के साथ स्वाभाविक बातचीत करें।'
                  : 'Get university exam answers, code examples, and step-by-step solutions with exact [Page X] citations.'}
              </p>
            </div>

            {/* Quick Action Pills on Welcome */}
            <div className="w-full space-y-2 pt-2 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
                Quick Prompts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActionPills.slice(0, 4).map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(pill.prompt)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs text-light-heading dark:text-dark-heading hover:border-brand-red/60 hover:bg-light-bg dark:hover:bg-dark-bg transition-all text-left group"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-brand-orange group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">{pill.label}</span>
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm space-y-2.5 ${
                    isUser
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-tr-none'
                      : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading rounded-tl-none'
                  }`}
                >
                  {/* Message Content */}
                  <div className={`text-xs sm:text-sm leading-relaxed ${isIndic ? 'indic-text' : ''}`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderChatMarkdown(msg.text, handleOpenCitation, msg)
                    )}
                  </div>

                  {/* Assistant Citations & Action Controls */}
                  {!isUser && (
                    <div className="pt-2 border-t border-light-border/60 dark:border-dark-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Source Citation Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {msg.citedPages && msg.citedPages.length > 0 ? (
                          <>
                            <span className="text-[11px] font-medium text-light-body dark:text-dark-body">
                              Sources:
                            </span>
                            {msg.citedPages.map((page) => (
                              <button
                                key={page}
                                type="button"
                                onClick={() => handleOpenCitation(page, msg)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-red/10 dark:bg-brand-red/20 text-brand-red dark:text-brand-redBright hover:bg-brand-red hover:text-white transition-colors text-[11px] font-semibold border border-brand-red/20 cursor-pointer"
                                title={`Open Page ${page} in PDF Viewer`}
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
                          type="button"
                          onClick={() => toggleTTS(msg.id, msg.text)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSpeakingThis
                              ? 'bg-status-error text-white'
                              : 'hover:bg-light-bg dark:hover:bg-dark-bg text-light-body dark:text-dark-body'
                          }`}
                          title={isSpeakingThis ? 'Stop Reading' : 'Read aloud (TTS)'}
                        >
                          {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
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

                  {/* Follow-up Question Suggestions */}
                  {!isUser && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-light-border/40 dark:border-dark-border/40 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        Suggested Next Questions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUpSuggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSendMessage(sug)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading hover:border-brand-orange hover:text-brand-orange transition-all text-left"
                          >
                            <span>{sug}</span>
                            <ArrowRight className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Message Edit & Timestamp */}
                  <div className={`flex items-center justify-between text-[10px] pt-1 ${isUser ? 'text-white/80' : 'text-light-body/80 dark:text-dark-body/80'}`}>
                    {isUser && (
                      <button
                        type="button"
                        onClick={() => handleEditMessage(msg.text)}
                        className="hover:underline flex items-center gap-1"
                        title="Edit and resend"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    <span className="ml-auto">{msg.timestamp}</span>
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

        {/* Loading / Thinking Indicator with Docify Logo */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-glow-cyan">
              <DocifyLogo size="xs" animated={true} withGlow={true} />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs text-light-body dark:text-dark-body flex items-center gap-3">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce [animation-delay:0.4s]" />
              </span>
              <span className="font-medium text-light-heading dark:text-dark-heading">Docify AI is thinking & formulating response...</span>

              <button
                type="button"
                onClick={handleStopGenerating}
                className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-status-error/10 text-status-error text-[11px] font-bold hover:bg-status-error hover:text-white transition-colors"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Bar */}
      <div className="px-4 py-2 border-t border-light-border/40 dark:border-dark-border/40 bg-light-surface/60 dark:bg-dark-surface/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-orange" />
          Exam Modes:
        </span>
        {quickActionPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(pill.prompt)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading hover:border-brand-red hover:text-brand-red transition-all shrink-0"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. INPUT BAR WITH STT, REGENERATE & RE-SEND */}
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
          {/* Voice Input */}
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

          {/* Regenerate Button if messages exist */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:text-brand-orange hover:border-brand-orange transition-all"
              title="Regenerate last answer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to speech...'
                : language === 'gu'
                ? 'દસ્તાવેજ સંબંધિત પ્રશ્ન પૂછો...'
                : language === 'hi'
                ? 'दस्तावेज़ से संबंधित प्रश्न पूछें...'
                : 'Ask a question or request an exam answer (2M, 4M, 6M, 10M)...'
            }
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs sm:text-sm text-light-heading dark:text-dark-heading placeholder:text-light-body/60 dark:placeholder:text-dark-body/60 focus:outline-none focus:border-brand-red/60 focus:ring-1 focus:ring-brand-red/60 transition-all ${
              isIndic ? 'indic-text' : ''
            }`}
          />

          {/* Send / Stop Button */}
          {isLoading ? (
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleStopGenerating}
              leftIcon={Square}
              className="px-4 text-xs sm:text-sm"
            >
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputQuestion.trim()}
              leftIcon={Send}
              className="bg-brand-gradient shadow-glow-red px-4 text-xs sm:text-sm"
            >
              Ask
            </Button>
          )}
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
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shrink-0">
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

                {/* Page Navigation */}
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

                {/* Right controls */}
                <div className="flex items-center gap-2">
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

                  {activePdfModal.fileUrl && (
                    <a
                      href={`${activePdfModal.fileUrl}#page=${activePdfModal.pageNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-light-body hover:text-brand-red dark:text-dark-body dark:hover:text-brand-redBright hover:bg-light-bg dark:hover:bg-dark-bg border border-light-border dark:border-dark-border transition-colors"
                      title="Open full PDF in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setActivePdfModal(null)}
                    className="p-2 rounded-xl text-light-body hover:text-light-heading dark:text-dark-body dark:hover:text-dark-heading hover:bg-light-bg dark:hover:bg-dark-bg border border-light-border dark:border-dark-border transition-colors"
                    title="Close Viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 relative flex flex-col bg-zinc-900 overflow-hidden">
                {activePdfModal.viewMode === 'pdf' && activePdfModal.fileUrl ? (
                  <div className="flex-1 w-full h-full relative flex flex-col">
                    <iframe
                      key={`${activePdfModal.fileUrl}#page=${activePdfModal.pageNumber}`}
                      src={`${activePdfModal.fileUrl}#page=${activePdfModal.pageNumber}&view=FitH`}
                      className="w-full flex-1 border-none bg-white dark:bg-zinc-950"
                      title={`PDF Page Viewer - ${activePdfModal.documentName} Page ${activePdfModal.pageNumber}`}
                    />

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
