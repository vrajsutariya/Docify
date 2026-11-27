import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Calculator,
  Copy,
  Check,
  Languages,
  HelpCircle,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AutoChart } from '../charts/AutoChart';
import { DocifyLoadingBar } from '../common/DocifyLoadingBar';

export const AskDataChat = ({
  dataset,
  onAskQuestion,
  loading = false,
}) => {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const [copiedId, setCopiedId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const samplePrompts = [
    'What is the total sum across numeric fields?',
    'Show the highest performing category or record',
    'What is the average value for key metrics?',
    'How many total records are in this dataset?',
  ];

  const handleSubmit = async (qText) => {
    const textToQuery = qText || question;
    if (!textToQuery.trim() || !onAskQuestion || isQuerying || loading) return;

    const currentQuery = textToQuery.trim();
    setQuestion('');
    setIsQuerying(true);

    try {
      const res = await onAskQuestion(currentQuery, language);
      const data = res?.data || res;

      setConversationHistory((prev) => [
        {
          id: Date.now(),
          question: currentQuery,
          answer: data.answer,
          formula: data.calculationFormula,
          chart: data.chartRecommendation,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Error asking data question:', err);
      setConversationHistory((prev) => [
        {
          id: Date.now(),
          question: currentQuery,
          answer: 'Unable to calculate answer. Please try rephrasing your question or selecting another metric.',
          formula: 'ERROR_EVALUATING_QUERY',
          chart: null,
          isError: true,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopyFormula = (formulaText, id) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search / Query Input Card */}
      <Card className="p-5 space-y-4 border-light-border dark:border-dark-border shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading">
                "Ask Your Data" Natural Language Engine
              </h3>
              <p className="text-xs text-light-body dark:text-dark-body">
                Type queries in plain language; Docify returns verified answers and formula transparency.
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <Languages className="w-3.5 h-3.5 text-light-body dark:text-dark-body ml-2 mr-1" />
            {[
              { code: 'en', label: 'English' },
              { code: 'gu', label: 'ગુજરાતી' },
              { code: 'hi', label: 'हिन्दी' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  language === l.code
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-light-body dark:text-dark-body hover:bg-light-border/40 dark:hover:bg-dark-border/40'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder='e.g. "What was the total revenue?", "Which region had the lowest profit?", "Show average order value"'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full text-xs sm:text-sm pl-4 pr-10 py-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <Button
            type="submit"
            size="md"
            variant="primary"
            isLoading={loading || isQuerying}
            disabled={!question.trim() || isQuerying || loading}
            rightIcon={Send}
            className="bg-brand-gradient text-white !py-3 shadow-glow-cyan"
          >
            Ask
          </Button>
        </form>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-light-body dark:text-dark-body flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-brand-orange" />
            Quick Prompts:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isQuerying || loading}
              onClick={() => {
                setQuestion(p);
                handleSubmit(p);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-light-border dark:border-dark-border bg-light-surface/60 dark:bg-dark-surface/60 text-light-body dark:text-dark-body hover:text-brand-orange hover:border-brand-orange/40 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      {/* Conversation / Query Answers Stream */}
      <div className="space-y-4">
        {/* Instant Loading State Indicator with Docify Loading Bar */}
        {isQuerying && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-light-surface/90 dark:bg-dark-surface/90 border border-cyan-500/30 shadow-glow-cyan"
          >
            <DocifyLoadingBar
              label="Docify Natural Language Engine: Computing exact formula across all records..."
              sublabel="Parsing numeric values, computing mathematical aggregations, and preparing formula transparency"
              size="md"
              showLogo={true}
            />
          </motion.div>
        )}

        {conversationHistory.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Card className="p-5 space-y-4 border-light-border dark:border-dark-border hover:border-accent/40 transition-colors">
              {/* Question */}
              <div className="flex items-center justify-between pb-2 border-b border-light-border/60 dark:border-dark-border/60">
                <span className="text-xs font-heading font-semibold text-light-body dark:text-dark-body flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  Q: "{item.question}"
                </span>
                <span className="text-[10px] text-light-body/50 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Natural Language Answer */}
              <div className="text-sm sm:text-base font-heading font-medium text-light-heading dark:text-dark-heading leading-relaxed">
                {item.answer}
              </div>

              {/* Formula & Calculation Transparency Box (SRS Item 2) */}
              {item.formula && (
                <div className="p-3.5 rounded-xl bg-light-surface/80 dark:bg-dark-surface/80 border border-light-border dark:border-dark-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-light-body dark:text-dark-body flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-brand-orange" />
                      Formula / Query Transparency:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyFormula(item.formula, item.id)}
                      className="text-[10px] font-semibold flex items-center gap-1 text-light-body hover:text-accent transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-status-success" />
                          <span className="text-status-success">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Formula</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-brand-orange dark:text-brand-orangeBright overflow-x-auto whitespace-pre-wrap select-all">
                    {item.formula}
                  </pre>
                </div>
              )}

              {/* Embedded AutoChart if chart is recommended */}
              {item.chart && item.chart.data && (
                <div className="pt-2">
                  <AutoChart chartConfig={item.chart} height={260} />
                </div>
              )}
            </Card>
          </motion.div>
        ))}

        {conversationHistory.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-light-surface/40 dark:bg-dark-surface/40 border border-dashed border-light-border dark:border-dark-border space-y-3">
            <Calculator className="w-10 h-10 text-accent mx-auto opacity-40" />
            <h4 className="font-heading font-semibold text-sm text-light-heading dark:text-dark-heading">
              Ready to Answer Questions with Formula Transparency
            </h4>
            <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
              Ask about sums, averages, maximums, minimums, and category breakdowns. Docify computes the exact result and shows the mathematical formula.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskDataChat;
