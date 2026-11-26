import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  BookOpen,
  Filter,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FlipCard } from './FlipCard';
import { updateFlashcardProgress } from '../../services/quizService';

export const FlashcardDeck = ({
  quizId,
  initialFlashcards = [],
  title = 'Study Flashcards',
  language = 'en',
  onFinishSession,
}) => {
  const [cards, setCards] = useState(initialFlashcards);
  // Active queue of card indices to review in current session
  const [queue, setQueue] = useState(
    initialFlashcards.map((_, idx) => idx)
  );
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [filterBox, setFilterBox] = useState('all'); // 'all' | 1 | 2 | 3

  useEffect(() => {
    setCards(initialFlashcards);
    setQueue(initialFlashcards.map((_, idx) => idx));
    setCurrentQueueIndex(0);
    setIsSessionComplete(false);
  }, [initialFlashcards]);

  // Handle Keyboard shortcuts (Space = flip, ArrowLeft = Don't Know, ArrowRight = Know)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!cards || cards.length === 0) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-xl mx-auto">
        <Layers className="w-12 h-12 text-light-body mx-auto opacity-40" />
        <h3 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading">
          No Flashcards Available
        </h3>
        <p className="text-xs text-light-body">
          Generate an AI assessment to automatically create 3D Leitner spaced repetition flashcards.
        </p>
      </Card>
    );
  }

  // Leitner Box Counts
  const totalCards = cards.length;
  const box1Count = cards.filter((c) => (c.box || 1) === 1).length;
  const box2Count = cards.filter((c) => c.box === 2).length;
  const box3Count = cards.filter((c) => c.box === 3).length;
  const masteryPercentage = totalCards > 0 ? Math.round((box3Count / totalCards) * 100) : 0;

  // Active card
  const activeCardIndex = queue[currentQueueIndex];
  const activeCard = cards[activeCardIndex];

  // Handle "Know" or "Don't Know"
  const handleAnswer = async (isKnown) => {
    if (!activeCard) return;

    const action = isKnown ? 'know' : 'dont_know';
    const currentBox = activeCard.box || 1;
    const newBox = isKnown ? Math.min(3, currentBox + 1) : 1;

    // 1. Update card locally
    const updatedCards = [...cards];
    updatedCards[activeCardIndex] = {
      ...updatedCards[activeCardIndex],
      box: newBox,
    };
    setCards(updatedCards);

    // 2. Persist to backend if quizId is available
    if (quizId) {
      updateFlashcardProgress(quizId, activeCard.id, action).catch((err) =>
        console.warn('[FlashcardDeck] Error updating card progress:', err)
      );
    }

    // 3. Spaced Repetition queue management:
    // If "Don't Know": re-insert card at the end of the queue so it repeats until mastered
    const newQueue = [...queue];
    if (!isKnown) {
      newQueue.push(activeCardIndex);
    }

    setIsFlipped(false);

    if (currentQueueIndex + 1 < newQueue.length) {
      setQueue(newQueue);
      setCurrentQueueIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
    }
  };

  // Restart Study Session
  const handleRestartSession = (boxFilter = 'all') => {
    let newIndices = [];
    if (boxFilter === 'all') {
      newIndices = cards.map((_, idx) => idx);
    } else {
      newIndices = cards
        .map((c, idx) => ((c.box || 1) === boxFilter ? idx : null))
        .filter((idx) => idx !== null);
    }

    if (newIndices.length === 0) {
      newIndices = cards.map((_, idx) => idx);
    }

    setFilterBox(boxFilter);
    setQueue(newIndices);
    setCurrentQueueIndex(0);
    setIsFlipped(false);
    setIsSessionComplete(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* 1. Header with Leitner 3-Box Counters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-orange" />
              {title}
            </h3>
            <p className="text-xs text-light-body">
              Leitner 3-Box Spaced Repetition Engine
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Box 1 (Frequent) */}
            <div className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Box 1: {box1Count}</span>
            </div>

            {/* Box 2 (Review) */}
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Box 2: {box2Count}</span>
            </div>

            {/* Box 3 (Mastered) */}
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Box 3: {box3Count}</span>
            </div>
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-light-body">
            <span>Overall Deck Mastery</span>
            <span className="text-emerald-500 font-mono font-bold">
              {masteryPercentage}% ({box3Count}/{totalCards})
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-light-border dark:bg-dark-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-red via-brand-orange to-emerald-500 transition-all duration-300"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* 2. Main Flip Card or Session Completion Screen */}
      {isSessionComplete ? (
        <Card className="p-8 sm:p-10 text-center space-y-6 bg-gradient-to-br from-light-surface via-transparent to-emerald-500/10 dark:from-dark-surface dark:to-emerald-500/10 border-light-border dark:border-dark-border">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mx-auto shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-2xl text-light-heading dark:text-dark-heading">
              Study Session Completed!
            </h3>
            <p className="text-xs sm:text-sm text-light-body max-w-md mx-auto">
              You reviewed all queued concepts in this session. Hard cards were cycled back and reinforced.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border max-w-sm mx-auto space-y-2">
            <div className="text-xs font-semibold text-light-heading dark:text-dark-heading">
              Current Mastery Status
            </div>
            <div className="flex items-center justify-around text-xs font-mono font-bold pt-1">
              <span className="text-rose-500">Box 1: {box1Count}</span>
              <span className="text-amber-500">Box 2: {box2Count}</span>
              <span className="text-emerald-500">Box 3: {box3Count}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={RotateCcw}
              onClick={() => handleRestartSession('all')}
              className="bg-brand-gradient shadow-glow-red"
            >
              Review Entire Deck
            </Button>

            {box1Count > 0 && (
              <Button
                variant="outline"
                size="md"
                leftIcon={Filter}
                onClick={() => handleRestartSession(1)}
              >
                Practice Box 1 Only ({box1Count})
              </Button>
            )}

            {onFinishSession && (
              <Button variant="secondary" size="md" onClick={onFinishSession}>
                Back to Assessment
              </Button>
            )}
          </div>
        </Card>
      ) : activeCard ? (
        <div className="space-y-4">
          {/* Card Counter & Queue Progress */}
          <div className="flex items-center justify-between text-xs text-light-body px-1">
            <span>
              Card {currentQueueIndex + 1} of {queue.length} in session
            </span>
            <span className="font-mono text-[11px] opacity-75">
              Shortcut: Space = Flip, ← = Don't Know, → = Know
            </span>
          </div>

          {/* 3D Flip Card */}
          <FlipCard
            front={activeCard.front}
            back={activeCard.back}
            topic={activeCard.topic}
            box={activeCard.box || 1}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            language={language}
          />

          {/* Action Buttons: Don't Know vs Know */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="danger"
              size="lg"
              leftIcon={XCircle}
              onClick={() => handleAnswer(false)}
              className="flex-1 max-w-xs shadow-sm text-xs sm:text-sm"
            >
              Don't Know (Box 1)
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 text-xs font-semibold"
            >
              Flip
            </Button>

            <Button
              variant="success"
              size="lg"
              leftIcon={CheckCircle2}
              onClick={() => handleAnswer(true)}
              className="flex-1 max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs sm:text-sm"
            >
              Know (Advance)
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FlashcardDeck;
