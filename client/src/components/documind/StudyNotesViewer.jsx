import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  RefreshCw,
  Sparkles,
  BookOpen,
  Languages,
  CheckCircle2,
  Lightbulb,
  Key,
  Bookmark,
  Award,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  GraduationCap,
  Layers,
  HelpCircle,
  FolderPlus,
  FolderMinus,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

/**
 * Parses markdown notes into modules, topics, and question bank sections
 */
const parseMasterNotes = (markdownText) => {
  if (!markdownText) return { overview: '', topics: [], questionBank: [] };

  const lines = markdownText.split('\n');
  let currentCategory = 'overview'; // 'overview' | 'topics' | 'questions'
  let overviewLines = [];
  const rawTopics = [];
  const rawQuestions = [];

  let activeTopic = null;
  let activeQuestionSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^##\s+(?:📌|🎯)?\s*(?:Syllabus|વિષયવાર|विषयवार|Topic|Module)/i.test(line)) {
      currentCategory = 'topics';
    } else if (/^##\s+(?:🎯)?\s*(?:University Examination Question Bank|પરીક્ષા પ્રશ્ન બેંક|परीक्षा प्रश्न बैंक|Question Bank)/i.test(line)) {
      currentCategory = 'questions';
    }

    if (currentCategory === 'overview') {
      overviewLines.push(line);
    } else if (currentCategory === 'topics') {
      if (/^###\s+(?:📖)?\s*(.+)/i.test(line)) {
        if (activeTopic) rawTopics.push(activeTopic);
        const title = line.replace(/^###\s+(?:📖)?\s*/i, '').trim();
        activeTopic = { title, contentLines: [] };
      } else if (activeTopic) {
        activeTopic.contentLines.push(line);
      }
    } else if (currentCategory === 'questions') {
      if (/^###\s+(?:🟢|🟡|🟠|🔴)?\s*(.+)/i.test(line)) {
        if (activeQuestionSection) rawQuestions.push(activeQuestionSection);
        const heading = line.replace(/^###\s+(?:🟢|🟡|🟠|🔴)?\s*/i, '').trim();
        let marksTag = '2M';
        if (/2\s*Marks?|૨\s*ગુણ|२\s*अंक/i.test(heading)) marksTag = '2M';
        else if (/4\s*Marks?|૪\s*ગુણ|४\s*अंक/i.test(heading)) marksTag = '4M';
        else if (/6\s*Marks?|૬\s*ગુણ|६\s*अंक/i.test(heading)) marksTag = '6M';
        else if (/8|10\s*Marks?|૮|૧૦\s*ગુણ|८|१०\s*अंक/i.test(heading)) marksTag = '10M';

        activeQuestionSection = { heading, marksTag, contentLines: [] };
      } else if (activeQuestionSection) {
        activeQuestionSection.contentLines.push(line);
      }
    }
  }

  if (activeTopic) rawTopics.push(activeTopic);
  if (activeQuestionSection) rawQuestions.push(activeQuestionSection);

  return {
    overview: overviewLines.join('\n').trim(),
    topics: rawTopics.map((t, idx) => ({ id: `topic-${idx}`, ...t, content: t.contentLines.join('\n').trim() })),
    questionBank: rawQuestions.map((q, idx) => ({ id: `qsec-${idx}`, ...q, content: q.contentLines.join('\n').trim() })),
  };
};

/**
 * Clean markdown block formatter
 */
const renderFormattedContent = (content) => {
  if (!content) return null;

  // Split into major subsections (#### or lines)
  const sections = content.split(/(?=\n####\s+)/);

  return sections.map((sec, sIdx) => {
    const trimmed = sec.trim();
    if (!trimmed) return null;

    const isSubHeader = trimmed.startsWith('####');
    let title = '';
    let body = trimmed;

    if (isSubHeader) {
      const lines = trimmed.split('\n');
      title = lines[0].replace(/^####\s+/, '').trim();
      body = lines.slice(1).join('\n').trim();
    }

    return (
      <div key={sIdx} className="space-y-2 mb-4 last:mb-0">
        {title && (
          <h4 className="font-heading font-semibold text-xs sm:text-sm text-brand-orange dark:text-brand-orangeBright flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm leading-relaxed text-light-body dark:text-dark-body whitespace-pre-line font-normal space-y-1.5">
          {body}
        </div>
      </div>
    );
  });
};

export const StudyNotesViewer = ({
  documentId,
  documentTitle,
  initialNotes = '',
  onFetchNotes,
}) => {
  const [notesMarkdown, setNotesMarkdown] = useState(initialNotes);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Tabs: 'all' | 'topics' | '2M' | '4M' | '6M' | '10M'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedItems, setCollapsedItems] = useState(new Set());

  const loadNotes = useCallback(
    async (lang = language, force = false) => {
      if (!documentId) return;
      setLoading(true);
      setError(null);
      try {
        if (onFetchNotes) {
          const res = await onFetchNotes(documentId, lang, force);
          setNotesMarkdown(res?.data?.studyNotes || res?.studyNotes || '');
        }
      } catch (err) {
        console.error('Error fetching study notes:', err);
        setError(err.message || 'Failed to generate exam study notes.');
      } finally {
        setLoading(false);
      }
    },
    [documentId, language, onFetchNotes]
  );

  useEffect(() => {
    if (!initialNotes && documentId) {
      loadNotes('en', false);
    } else if (initialNotes) {
      setNotesMarkdown(initialNotes);
    }
  }, [documentId, initialNotes, loadNotes]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    loadNotes(newLang, false);
  };

  const handleCopy = (textToCopy = notesMarkdown) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notesMarkdown) return;
    const blob = new Blob([notesMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = (documentTitle || 'exam-study-notes').replace(/[^a-zA-Z0-9_-]/g, '-');
    link.download = `${cleanTitle}-notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleCollapse = (id) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const parsed = useMemo(() => parseMasterNotes(notesMarkdown), [notesMarkdown]);

  const handleExpandAll = () => setCollapsedItems(new Set());
  const handleCollapseAll = () => {
    const allIds = [
      ...parsed.topics.map((t) => t.id),
      ...parsed.questionBank.map((q) => q.id),
    ];
    setCollapsedItems(new Set(allIds));
  };

  // Filter topics and question bank based on activeFilter & searchQuery
  const filteredTopics = useMemo(() => {
    if (['2M', '4M', '6M', '10M'].includes(activeFilter)) return [];
    return parsed.topics.filter((t) => {
      if (!searchQuery) return true;
      return (
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [parsed.topics, activeFilter, searchQuery]);

  const filteredQuestions = useMemo(() => {
    if (activeFilter === 'topics') return [];
    return parsed.questionBank.filter((q) => {
      if (activeFilter !== 'all' && q.marksTag !== activeFilter) return false;
      if (!searchQuery) return true;
      return (
        q.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [parsed.questionBank, activeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Floating Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border shadow-soft">
        {/* Left: Language Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <Languages className="w-4 h-4 text-light-body dark:text-dark-body ml-2 mr-1" />
          {[
            { code: 'en', label: 'English' },
            { code: 'gu', label: 'ગુજરાતી' },
            { code: 'hi', label: 'हिन्दी' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              disabled={loading}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                language === l.code
                  ? 'bg-brand-red text-white shadow-xs'
                  : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:bg-light-border/40 dark:hover:bg-dark-border/40'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-xs relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, terms, questions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>

        {/* Right: Actions (Expand/Collapse, Copy, Download, Print, Refresh) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExpandAll}
            className="p-2 rounded-xl text-light-body dark:text-dark-body hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
            title="Expand All"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={handleCollapseAll}
            className="p-2 rounded-xl text-light-body dark:text-dark-body hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
            title="Collapse All"
          >
            <FolderMinus className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-light-border dark:bg-dark-border mx-1" />

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleCopy()}
            leftIcon={copied ? Check : Copy}
            className={copied ? 'text-status-success border-status-success/40' : 'text-xs'}
          >
            {copied ? 'Copied' : 'Copy All'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            leftIcon={Download}
            className="text-xs"
            title="Download notes as Markdown file"
          >
            Download .MD
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            leftIcon={Printer}
            className="text-xs"
            title="Print or Save as PDF"
          >
            Print / PDF
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => loadNotes(language, true)}
            disabled={loading}
            title="Regenerate notes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-orange' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs by Marks & Topics */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-light-surface/40 dark:bg-dark-surface/40 border border-light-border dark:border-dark-border">
        {[
          { id: 'all', label: 'All Exam Notes', icon: Layers },
          { id: 'topics', label: 'Topic-by-Topic Only', icon: BookOpen },
          { id: '2M', label: '2 Marks (Short Recall)', icon: Award, color: 'text-emerald-500' },
          { id: '4M', label: '4 Marks (Medium Depth)', icon: Lightbulb, color: 'text-amber-500' },
          { id: '6M', label: '6 Marks (Long Analytical)', icon: GraduationCap, color: 'text-orange-500' },
          { id: '10M', label: '8–10 Marks (Detailed Essay)', icon: Sparkles, color: 'text-red-500' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-red text-white shadow-xs'
                  : 'text-light-body dark:text-dark-body hover:bg-light-surface dark:hover:bg-dark-surface hover:text-light-heading dark:hover:text-dark-heading'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color || ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && !notesMarkdown && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-orange border-t-transparent animate-spin mx-auto" />
          <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
            Synthesizing University Master Exam Notes...
          </h3>
          <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
            Deep-analyzing entire document, extracting syllabus modules, structured 2M/4M/6M/10M model answers in{' '}
            {language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिन्दी' : 'English'}.
          </p>
        </Card>
      )}

      {error && !notesMarkdown && (
        <Card className="p-8 text-center space-y-3 border-status-error/40">
          <p className="text-xs text-status-error font-medium">{error}</p>
          <Button size="sm" onClick={() => loadNotes(language, true)} leftIcon={RefreshCw}>
            Retry Generation
          </Button>
        </Card>
      )}

      {/* Main Study Notes Content */}
      {notesMarkdown && (
        <div id="printable-study-notes" className="space-y-6">
          {/* Overview / Subject Blueprint Card */}
          {parsed.overview && activeFilter === 'all' && (
            <Card className="p-6 border-brand-orange/30 bg-gradient-to-br from-light-surface to-brand-orange/5 dark:from-dark-surface dark:to-brand-orange/5">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-brand-orange" />
                <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading">
                  University Subject Overview & Examination Blueprint
                </h3>
              </div>
              <div className="text-xs sm:text-sm text-light-body dark:text-dark-body whitespace-pre-line leading-relaxed">
                {parsed.overview}
              </div>
            </Card>
          )}

          {/* Part 1: Topic-by-Topic Exam Notes */}
          {filteredTopics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
                <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-orange" />
                  Topic-by-Topic Comprehensive Notes ({filteredTopics.length})
                </h3>
              </div>

              {filteredTopics.map((topic) => {
                const isCollapsed = collapsedItems.has(topic.id);
                return (
                  <Card
                    key={topic.id}
                    className="overflow-hidden border-light-border dark:border-dark-border hover:border-brand-orange/40 transition-colors"
                  >
                    {/* Topic Accordion Header */}
                    <div
                      onClick={() => toggleCollapse(topic.id)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none bg-light-surface dark:bg-dark-surface hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-light-heading dark:text-dark-heading leading-snug">
                          {topic.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(`### ${topic.title}\n\n${topic.content}`);
                          }}
                          className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
                          title="Copy this topic"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <div className="text-light-body dark:text-dark-body">
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Topic Content */}
                    {!isCollapsed && (
                      <div className="p-5 sm:p-6 border-t border-light-border/60 dark:border-dark-border/60 bg-light-surface/40 dark:bg-dark-surface/40">
                        {renderFormattedContent(topic.content)}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Part 2: Question Bank by Marks */}
          {filteredQuestions.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
                <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  University Examination Question Bank (Mark-Wise Model Answers)
                </h3>
              </div>

              {filteredQuestions.map((qSec) => {
                const isCollapsed = collapsedItems.has(qSec.id);
                const badgeColor =
                  qSec.marksTag === '2M'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : qSec.marksTag === '4M'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : qSec.marksTag === '6M'
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';

                return (
                  <Card
                    key={qSec.id}
                    className="overflow-hidden border-light-border dark:border-dark-border hover:border-emerald-500/40 transition-colors"
                  >
                    <div
                      onClick={() => toggleCollapse(qSec.id)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none bg-light-surface dark:bg-dark-surface hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                          {qSec.marksTag}
                        </span>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-light-heading dark:text-dark-heading leading-snug">
                          {qSec.heading}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(`### ${qSec.heading}\n\n${qSec.content}`);
                          }}
                          className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
                          title="Copy this question section"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-light-body dark:text-dark-body">
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="p-5 sm:p-6 border-t border-light-border/60 dark:border-dark-border/60 bg-light-surface/30 dark:bg-dark-surface/30">
                        {renderFormattedContent(qSec.content)}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyNotesViewer;
