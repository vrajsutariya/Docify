import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  Layers,
  HelpCircle,
  ArrowLeft,
  Share2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { QuizCard } from '../../components/quiz/QuizCard';
import { ScoreBoard } from '../../components/quiz/ScoreBoard';
import { FlashcardDeck } from '../../components/flashcards/FlashcardDeck';
import { getQuizByShareId, submitQuizAttempt } from '../../services/quizService';

export const SharedQuizPage = () => {
  const { shareId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state: 'quiz' | 'scoreboard' | 'flashcards'
  const [viewState, setViewState] = useState('quiz');
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [lastAttemptResult, setLastAttemptResult] = useState(null);

  useEffect(() => {
    if (!shareId) return;

    setLoading(true);
    getQuizByShareId(shareId)
      .then((res) => {
        const data = res?.data || res;
        setQuiz(data);
        setActiveQuestions(data.questions || []);
      })
      .catch((err) => {
        console.error('Error fetching shared quiz:', err);
        setError(
          err?.response?.data?.message || 'Shared quiz could not be loaded or has expired.'
        );
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  // Handle quiz completion
  const handleQuizComplete = async ({ answers, timeTakenSeconds }) => {
    if (!quiz) return;

    try {
      const res = await submitQuizAttempt(quiz._id, {
        answers,
        timeTakenSeconds,
      });

      const attemptData = res?.data || {};
      setLastAttemptResult(attemptData);
      setViewState('scoreboard');
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
      // Fallback calculation on client if backend submission encountered an issue
      let score = 0;
      const wrongQuestionIds = [];
      const topicStats = {};

      activeQuestions.forEach((q) => {
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
        };
      }

      setLastAttemptResult({
        score,
        total: activeQuestions.length,
        timeTakenSeconds,
        wrongQuestionIds,
        topicBreakdown,
      });
      setViewState('scoreboard');
    }
  };

  // Retry Wrong Questions Only
  const handleRetryWrongOnly = () => {
    if (!quiz || !lastAttemptResult?.wrongQuestionIds) return;
    const wrongQs = quiz.questions.filter((q) =>
      lastAttemptResult.wrongQuestionIds.includes(q.id)
    );
    if (wrongQs.length > 0) {
      setActiveQuestions(wrongQs);
      setViewState('quiz');
    }
  };

  // Retake Full Quiz
  const handleRetakeFull = () => {
    if (!quiz) return;
    setActiveQuestions(quiz.questions || []);
    setViewState('quiz');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-light-body">Loading shared assessment...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-status-error mx-auto opacity-70" />
          <h3 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading">
            Quiz Not Found
          </h3>
          <p className="text-xs text-light-body">{error || 'This shared quiz link is invalid.'}</p>
          <Link to="/">
            <Button variant="primary" className="bg-brand-gradient shadow-glow-red">
              Go to Docify
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body py-8 px-4 sm:px-6">
      {/* Top Branding Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center text-white shadow-glow-red">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-base text-light-heading dark:text-dark-heading">
            Docify <span className="text-brand-red font-medium text-xs">Assessment</span>
          </span>
        </Link>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewState === 'quiz' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewState('quiz')}
            className={`text-xs ${viewState === 'quiz' ? 'bg-brand-gradient' : ''}`}
          >
            Take Quiz
          </Button>

          {quiz.flashcards?.length > 0 && (
            <Button
              variant={viewState === 'flashcards' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={Layers}
              onClick={() => setViewState('flashcards')}
              className={`text-xs ${viewState === 'flashcards' ? 'bg-brand-gradient' : ''}`}
            >
              Flashcards ({quiz.flashcards.length})
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto">
        {viewState === 'quiz' && (
          <QuizCard
            questions={activeQuestions}
            quizTitle={quiz.title}
            language={quiz.language}
            onComplete={handleQuizComplete}
          />
        )}

        {viewState === 'scoreboard' && lastAttemptResult && (
          <ScoreBoard
            score={lastAttemptResult.score}
            total={lastAttemptResult.total}
            timeTakenSeconds={lastAttemptResult.timeTakenSeconds}
            wrongQuestionIds={lastAttemptResult.wrongQuestionIds}
            topicBreakdown={lastAttemptResult.topicBreakdown}
            shareId={quiz.shareId}
            quizId={quiz._id}
            onRetryWrongOnly={handleRetryWrongOnly}
            onRetakeFull={handleRetakeFull}
            onSwitchToFlashcards={() => setViewState('flashcards')}
          />
        )}

        {viewState === 'flashcards' && (
          <FlashcardDeck
            quizId={quiz._id}
            initialFlashcards={quiz.flashcards || []}
            title={`${quiz.title} - Flashcards`}
            language={quiz.language}
            onFinishSession={() => setViewState('quiz')}
          />
        )}
      </main>
    </div>
  );
};

export default SharedQuizPage;
