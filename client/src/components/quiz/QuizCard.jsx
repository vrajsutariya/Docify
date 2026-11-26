import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Send,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const QuizCard = ({
  questions = [],
  quizTitle = 'Assessment Quiz',
  timeLimitSeconds = 0, // 0 = untimed or calculated based on questions (e.g. 60s per question)
  onComplete,
  language = 'en',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: answer }
  const [answeredState, setAnsweredState] = useState({}); // { [questionId]: { isSubmitted: boolean, isCorrect: boolean } }
  const [textInput, setTextInput] = useState('');

  // Exam timer
  const initialTime = timeLimitSeconds > 0 ? timeLimitSeconds : questions.length * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (initialTime <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialTime]);

  // When time runs out, automatically trigger completion
  useEffect(() => {
    if (isTimeUp) {
      handleFinishExam();
    }
  }, [isTimeUp]);

  if (!questions || questions.length === 0) {
    return (
      <Card className="p-8 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-light-body mx-auto opacity-40" />
        <h3 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading">
          No Questions Available
        </h3>
        <p className="text-xs text-light-body">
          This quiz does not contain any questions. Please generate a new assessment.
        </p>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = Boolean(answeredState[currentQ.id]?.isSubmitted);
  const currentAnswerInfo = answeredState[currentQ.id];
  const isIndic = language === 'gu' || language === 'hi';

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const timerPercentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 100;
  const isUrgent = timeLeft < 60 && timeLeft > 0;

  // Handle Option Select (MCQ / True-False)
  const handleSelectOption = (option) => {
    if (isAnswered) return;

    const isCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
    setAnsweredState((prev) => ({
      ...prev,
      [currentQ.id]: { isSubmitted: true, isCorrect },
    }));
  };

  // Handle Text Submit (Fill in the Blank / Short Answer)
  const handleTextSubmit = (e) => {
    e?.preventDefault();
    if (isAnswered || !textInput.trim()) return;

    const trimmedInput = textInput.trim();
    const isCorrect =
      trimmedInput.toLowerCase() === currentQ.correctAnswer.trim().toLowerCase() ||
      (currentQ.type === 'fill_in_the_blank' &&
        currentQ.correctAnswer.toLowerCase().includes(trimmedInput.toLowerCase()) &&
        trimmedInput.length >= 3);

    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: trimmedInput }));
    setAnsweredState((prev) => ({
      ...prev,
      [currentQ.id]: { isSubmitted: true, isCorrect },
    }));
    setTextInput('');
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTextInput('');
    } else {
      handleFinishExam();
    }
  };

  // Complete exam
  const handleFinishExam = () => {
    const timeTaken = initialTime - timeLeft;
    onComplete({
      answers: selectedAnswers,
      timeTakenSeconds: timeTaken,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* 1. Exam Header with Timer & Progress */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading truncate max-w-md">
              {quizTitle}
            </h3>
            <div className="flex items-center gap-2 text-xs text-light-body dark:text-dark-body">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>&bull;</span>
              <Badge variant="brand" size="sm" className="text-[10px]">
                {currentQ.topic || 'General'}
              </Badge>
              {currentQ.sourcePage && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-brand-orange">
                  <BookOpen className="w-3 h-3" />
                  [Page {currentQ.sourcePage}]
                </span>
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
              isUrgent
                ? 'bg-status-error/10 border-status-error text-status-error animate-pulse'
                : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-status-error' : 'text-brand-orange'}`} />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-light-border dark:bg-dark-border overflow-hidden">
          <motion.div
            className="h-full bg-brand-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Card>

      {/* 2. Interactive Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Question Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-red font-semibold">
                  {currentQ.type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-light-body">
                  {isAnswered ? (
                    currentAnswerInfo.isCorrect ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )
                  ) : (
                    'Select or submit answer'
                  )}
                </span>
              </div>
              <h4
                className={`font-heading font-semibold text-base sm:text-lg text-light-heading dark:text-dark-heading leading-relaxed ${
                  isIndic ? 'indic-text' : ''
                }`}
              >
                {currentQ.question}
              </h4>
            </div>

            {/* Question Options / Input Area */}
            {['mcq', 'true_false'].includes(currentQ.type) && currentQ.options?.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === option;
                  const isCorrectOption =
                    option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

                  let optionStyle =
                    'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading hover:border-brand-red/50';

                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle =
                        'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold';
                    } else {
                      optionStyle = 'opacity-40 border-light-border dark:border-dark-border';
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(option)}
                      animate={
                        isAnswered && isSelected && !isCorrectOption
                          ? { x: [0, -8, 8, -8, 8, 0] }
                          : {}
                      }
                      transition={{ duration: 0.4 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all text-xs sm:text-sm ${optionStyle} ${
                        isIndic ? 'indic-text' : ''
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isAnswered && isCorrectOption
                            ? 'bg-emerald-500 text-white'
                            : isAnswered && isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isAnswered && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* Fill in the blank or Short Answer */
              <div className="space-y-3">
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <input
                    type="text"
                    disabled={isAnswered}
                    value={isAnswered ? selectedAnswers[currentQ.id] : textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                      language === 'gu'
                        ? 'તમારો જવાબ અહીં લખો...'
                        : language === 'hi'
                        ? 'अपना उत्तर यहाँ लिखें...'
                        : 'Type your answer here...'
                    }
                    className={`flex-1 px-4 py-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs sm:text-sm text-light-heading dark:text-dark-heading focus:outline-none focus:border-brand-red ${
                      isIndic ? 'indic-text' : ''
                    }`}
                  />
                  {!isAnswered && (
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={!textInput.trim()}
                      leftIcon={Send}
                      className="bg-brand-gradient shadow-glow-red"
                    >
                      Submit
                    </Button>
                  )}
                </form>

                {isAnswered && !currentAnswerInfo.isCorrect && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                    <span className="font-semibold">Correct Answer:</span> {currentQ.correctAnswer}
                  </div>
                )}
              </div>
            )}

            {/* 3. Detailed Explanation Card (Revealed after answering) */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-2"
                >
                  <div className="p-4 sm:p-5 rounded-2xl bg-light-bg/70 dark:bg-dark-bg/70 border border-light-border dark:border-dark-border space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-light-heading dark:text-dark-heading">
                      <Sparkles className="w-4 h-4 text-brand-orange" />
                      Pedagogical Explanation
                    </div>
                    <p
                      className={`text-xs sm:text-sm text-light-body dark:text-dark-body leading-relaxed ${
                        isIndic ? 'indic-text' : ''
                      }`}
                    >
                      {currentQ.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Action Footer: Next / Finish */}
            <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
              <span className="text-xs text-light-body">
                {currentIndex + 1} of {questions.length} answered
              </span>

              <Button
                variant="primary"
                size="md"
                disabled={!isAnswered}
                rightIcon={currentIndex < questions.length - 1 ? ArrowRight : Sparkles}
                onClick={handleNext}
                className="bg-brand-gradient shadow-glow-red"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Final Scoreboard'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizCard;
