import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Share2,
  Printer,
  Sparkles,
  AlertTriangle,
  Layers,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getQuizExportUrl } from '../../services/quizService';

export const ScoreBoard = ({
  score = 0,
  total = 0,
  timeTakenSeconds = 0,
  wrongQuestionIds = [],
  topicBreakdown = {},
  shareId,
  quizId,
  onRetryWrongOnly,
  onRetakeFull,
  onSwitchToFlashcards,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Grade determination
  let grade = 'Needs Practice';
  let gradeColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';

  if (percentage >= 90) {
    grade = 'Grade A+ (Exemplary)';
    gradeColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  } else if (percentage >= 80) {
    grade = 'Grade A (Proficient)';
    gradeColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  } else if (percentage >= 70) {
    grade = 'Grade B (Competent)';
    gradeColor = 'text-sky-500 bg-sky-500/10 border-sky-500/20';
  } else if (percentage >= 60) {
    grade = 'Grade C (Developing)';
    gradeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    if (mins === 0) return `${remaining}s`;
    return `${mins}m ${remaining}s`;
  };

  const handleShareLink = () => {
    if (!shareId) return;
    const url = `${window.location.origin}/quiz/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleExportPrint = () => {
    if (!quizId) return;
    const exportUrl = getQuizExportUrl(quizId, true);
    window.open(exportUrl, '_blank');
  };

  const hasWrongQuestions = Array.isArray(wrongQuestionIds) && wrongQuestionIds.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* 1. Score Summary Card */}
      <Card className="p-6 sm:p-8 text-center space-y-6 bg-gradient-to-br from-light-surface via-transparent to-brand-red/5 dark:from-dark-surface dark:to-brand-red/10 border-light-border dark:border-dark-border">
        {/* Trophy / Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white mx-auto shadow-glow-red">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide font-mono" style={{ borderColor: 'inherit' }}>
            <span className={gradeColor}>{grade}</span>
          </div>
          <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-light-heading dark:text-dark-heading">
            {score} <span className="text-xl text-light-body">/ {total}</span>
          </h3>
          <p className="text-sm font-semibold text-brand-red dark:text-brand-redBright">
            {percentage}% Mastery Achieved
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div className="p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
            <div className="text-[10px] uppercase font-semibold text-light-body">Correct</div>
            <div className="text-lg font-bold text-emerald-500">{score}</div>
          </div>
          <div className="p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
            <div className="text-[10px] uppercase font-semibold text-light-body">Incorrect</div>
            <div className="text-lg font-bold text-rose-500">{wrongQuestionIds.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
            <div className="text-[10px] uppercase font-semibold text-light-body">Time Taken</div>
            <div className="text-lg font-bold text-brand-orange flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeTakenSeconds)}
            </div>
          </div>
        </div>

        {/* Top Action Pills: Retry Wrong, Flashcards, Export */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {hasWrongQuestions && onRetryWrongOnly && (
            <Button
              variant="primary"
              size="md"
              leftIcon={RotateCcw}
              onClick={onRetryWrongOnly}
              className="bg-brand-gradient shadow-glow-red text-xs sm:text-sm"
            >
              Retry Wrong Questions ({wrongQuestionIds.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            leftIcon={RotateCcw}
            onClick={onRetakeFull}
            className="text-xs sm:text-sm"
          >
            Retake Full Quiz
          </Button>

          {onSwitchToFlashcards && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={Layers}
              onClick={onSwitchToFlashcards}
              className="text-xs sm:text-sm"
            >
              Study Flashcards
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            leftIcon={Printer}
            onClick={handleExportPrint}
            className="text-xs sm:text-sm"
          >
            Export / Print
          </Button>

          {shareId && (
            <Button
              variant={copiedShare ? 'success' : 'outline'}
              size="md"
              leftIcon={copiedShare ? Check : Share2}
              onClick={handleShareLink}
              className="text-xs sm:text-sm"
            >
              {copiedShare ? 'Link Copied!' : 'Share Quiz'}
            </Button>
          )}
        </div>
      </Card>

      {/* 2. Weak-Topic Analysis Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <h4 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading">
              Weak-Topic Analysis & Diagnostic Breakdown
            </h4>
          </div>
          <span className="text-xs text-light-body">
            Categorized by subtopics
          </span>
        </div>

        {Object.keys(topicBreakdown).length === 0 ? (
          <p className="text-xs text-light-body py-2">
            Topic breakdown data evaluated across all answered questions.
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            {Object.entries(topicBreakdown).map(([topic, stat]) => {
              const topicPct = stat.percentage ?? 0;
              const isWeak = topicPct < 60;
              const isMastered = topicPct >= 80;

              return (
                <div
                  key={topic}
                  className="p-3.5 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-light-heading dark:text-dark-heading">
                      <span>{topic}</span>
                      {isWeak && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-bold text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Weak Topic
                        </span>
                      )}
                      {isMastered && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-light-body">
                      {stat.correct}/{stat.total} ({topicPct}%)
                    </span>
                  </div>

                  {/* Topic Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-light-surface dark:bg-dark-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWeak
                          ? 'bg-rose-500'
                          : isMastered
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${topicPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScoreBoard;
