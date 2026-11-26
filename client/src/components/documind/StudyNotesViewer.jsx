import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

/**
 * Parses markdown study notes into high-yield structured callouts
 */
const parseStudyNotesSections = (markdownText) => {
  if (!markdownText) return [];

  const rawSections = markdownText.split(/(?=\n##\s+)/);
  const sections = [];

  rawSections.forEach((sec, idx) => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    const lines = trimmed.split('\n');
    let title = lines[0].replace(/^#+\s*/, '').trim();
    const contentLines = lines.slice(1).join('\n').trim();

    // Determine type/icon
    let type = 'general';
    let icon = BookOpen;
    let badgeColor = 'text-accent border-accent/30 bg-accent/10';

    if (/summary|ઉદ્દેશ્ય|उद्देश्य/i.test(title)) {
      type = 'summary';
      icon = Bookmark;
      badgeColor = 'text-brand-orange border-brand-orange/30 bg-brand-orange/10';
    } else if (/term|definition|શરતો|વ્યાખ્યા|शब्दावली|परिभाषा/i.test(title)) {
      type = 'terms';
      icon = Key;
      badgeColor = 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10';
    } else if (/takeaway|yield|પોઇન્ટ્સ|निष्कर्ष/i.test(title)) {
      type = 'takeaways';
      icon = Award;
      badgeColor = 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    } else if (/formula|law|equation|સૂત્ર|નિયમ|सूत्र|समीकरण/i.test(title)) {
      type = 'formulas';
      icon = Lightbulb;
      badgeColor = 'text-amber-400 border-amber-400/30 bg-amber-400/10';
    }

    sections.push({
      id: `sec-${idx}`,
      title,
      type,
      icon,
      badgeColor,
      content: contentLines,
    });
  });

  return sections;
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

  const handleCopy = () => {
    if (!notesMarkdown) return;
    navigator.clipboard.writeText(notesMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = parseStudyNotesSections(notesMarkdown);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border shadow-soft">
        {/* Multilingual Toggle */}
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

        {/* Action Buttons: Copy, Print/PDF, Refresh */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            leftIcon={copied ? Check : Copy}
            className={copied ? 'text-status-success border-status-success/40' : ''}
          >
            {copied ? 'Copied!' : 'Copy Notes'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            leftIcon={Printer}
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

      {loading && !notesMarkdown && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-brand-orange border-t-transparent animate-spin mx-auto" />
          <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
            Synthesizing Exam-Ready Revision Notes...
          </h3>
          <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
            Extracting definitions, high-yield takeaways, and critical formulas in{' '}
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

      {/* Structured Revision Sections */}
      {notesMarkdown && (
        <div id="printable-study-notes" className="space-y-6">
          {sections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 space-y-4 border-light-border dark:border-dark-border hover:border-brand-orange/30 transition-colors">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-light-border dark:border-dark-border">
                    <div className={`p-2 rounded-xl border ${section.badgeColor}`}>
                      <SectionIcon className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                      {section.title}
                    </h3>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-light-body dark:text-dark-body leading-relaxed space-y-2 whitespace-pre-line">
                    {section.content}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudyNotesViewer;