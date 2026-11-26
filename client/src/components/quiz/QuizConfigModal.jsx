import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Sliders,
  X,
  HelpCircle,
  FileText,
  Layers,
  Languages,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const QuizConfigModal = ({
  isOpen,
  onClose,
  onGenerate,
  documentTitle = 'Document',
  pageCount = 1,
  isLoading = false,
}) => {
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTypes, setSelectedTypes] = useState([
    'mcq',
    'true_false',
    'fill_in_the_blank',
    'short_answer',
  ]);
  const [language, setLanguage] = useState('en');
  const [pageRange, setPageRange] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const toggleType = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      setError('Please select at least one question type.');
      return;
    }
    setError(null);
    onGenerate({
      questionCount,
      difficulty,
      types: selectedTypes,
      language,
      pageRange: pageRange.trim(),
    });
  };

  const questionTypes = [
    { id: 'mcq', label: 'Multiple Choice (MCQ)', desc: '4 options with 1 correct choice' },
    { id: 'true_false', label: 'True / False', desc: 'Binary verification statements' },
    { id: 'fill_in_the_blank', label: 'Fill in the Blanks', desc: 'Missing keyword completion' },
    { id: 'short_answer', label: 'Short Answer', desc: 'Conceptual explanations' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shadow-glow-red">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-light-heading dark:text-dark-heading">
                Configure AI Quiz & Flashcards
              </h3>
              <p className="text-xs text-light-body dark:text-dark-body truncate max-w-xs sm:max-w-md">
                Source: {documentTitle} ({pageCount} {pageCount === 1 ? 'page' : 'pages'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-light-body hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Question Count Slider & Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-orange" />
                Number of Questions
              </label>
              <span className="font-mono font-bold text-sm text-brand-red dark:text-brand-redBright px-2.5 py-0.5 rounded-lg bg-brand-red/10">
                {questionCount} Questions
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[5, 10, 15, 20, 25, 30].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuestionCount(preset)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    questionCount === preset
                      ? 'bg-brand-red text-white shadow-sm'
                      : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:text-light-heading'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-light-border dark:bg-dark-border accent-brand-red cursor-pointer"
            />
          </div>

          {/* 2. Difficulty Segmented Control */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
              Assessment Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', label: 'Easy', desc: 'Direct recall & definitions' },
                { id: 'medium', label: 'Medium', desc: 'Application & inferences' },
                { id: 'hard', label: 'Hard', desc: 'Nuanced analysis & edge-cases' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    difficulty === diff.id
                      ? 'border-brand-red bg-brand-red/10 text-light-heading dark:text-dark-heading font-semibold shadow-sm'
                      : 'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-brand-red/40'
                  }`}
                >
                  <div className="text-xs font-bold capitalize">{diff.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{diff.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Question Types Multi-Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
              Include Question Types
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {questionTypes.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleType(type.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-red/60 bg-brand-red/5 dark:bg-brand-red/10 text-light-heading dark:text-dark-heading'
                        : 'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body opacity-70'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-brand-red border-brand-red text-white'
                          : 'border-light-border dark:border-dark-border'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{type.label}</div>
                      <div className="text-[10px] text-light-body dark:text-dark-body">
                        {type.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Target Language & Page Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-brand-orange" />
                Target Language
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'gu', label: 'ગુજરાતી' },
                  { id: 'hi', label: 'हिन्दी' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      language === lang.id
                        ? 'bg-brand-gradient text-white shadow-sm'
                        : 'text-light-body dark:text-dark-body hover:text-light-heading'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Range Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-orange" />
                Page Scope (Optional)
              </label>
              <input
                type="text"
                placeholder={pageCount > 1 ? `e.g. 1-3, 5 (Max: ${pageCount})` : 'All pages'}
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs text-light-heading dark:text-dark-heading placeholder:text-light-body/50 focus:outline-none focus:border-brand-red/60 focus:ring-1 focus:ring-brand-red/60"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-light-border dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={Sparkles}
              isLoading={isLoading}
              className="bg-brand-gradient shadow-glow-red"
            >
              Generate Assessment
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QuizConfigModal;
