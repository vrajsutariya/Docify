import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Highlighter,
  Sliders,
  Sparkles,
  ListOrdered,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const SalientHighlighter = ({
  rawText = '',
  salientSentences = [],
  topPercent = 20,
  onThresholdChange,
  loading = false,
}) => {
  const [activeThreshold, setActiveThreshold] = useState(topPercent || 20);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(null);

  // Set of salient sentence indices for quick lookup
  const salientIndexMap = useMemo(() => {
    const map = new Map();
    (salientSentences || []).forEach((item) => {
      map.set(item.index, item.score);
    });
    return map;
  }, [salientSentences]);

  // Split raw text into sentences preserving original order
  const documentSentences = useMemo(() => {
    if (!rawText) return [];
    return rawText
      .split(/(?<=[.?!])\s+/)
      .map((s, idx) => ({
        index: idx,
        text: s.trim(),
      }))
      .filter((s) => s.text.length > 5);
  }, [rawText]);

  const handleThresholdClick = (percent) => {
    setActiveThreshold(percent);
    if (onThresholdChange) {
      onThresholdChange(percent);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Salience Threshold Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border shadow-soft">
        <div className="flex items-center gap-2">
          <Highlighter className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-heading font-semibold text-light-heading dark:text-dark-heading">
            Salience Threshold:
          </span>
          <div className="flex items-center gap-1">
            {[10, 20, 30].map((pct) => (
              <button
                key={pct}
                onClick={() => handleThresholdClick(pct)}
                disabled={loading}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeThreshold === pct
                    ? 'bg-amber-500 text-black shadow-xs font-bold'
                    : 'text-light-body dark:text-dark-body hover:bg-light-border/40 dark:hover:bg-dark-border/40'
                }`}
              >
                Top {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-light-body dark:text-dark-body">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <strong className="text-light-heading dark:text-dark-heading">
              {salientSentences.length}
            </strong>{' '}
            Salient Highlights
          </span>
          <span>•</span>
          <span>
            Total: <strong>{documentSentences.length}</strong> Sentences
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Document Reading View with Salient Highlights */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 space-y-4 max-h-[620px] overflow-y-auto leading-relaxed text-xs sm:text-sm text-light-body dark:text-dark-body select-text">
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <span className="text-xs font-heading font-bold text-light-heading dark:text-dark-heading flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-orange" />
                Document Reading View (Salience Highlighted)
              </span>
              <span className="text-[10px] text-light-body/60 dark:text-dark-body/60">
                Click any highlight to view score
              </span>
            </div>

            <div className="space-y-3">
              {documentSentences.length > 0 ? (
                documentSentences.map((s) => {
                  const isSalient = salientIndexMap.has(s.index);
                  const score = salientIndexMap.get(s.index);
                  const isSelected = selectedSentenceIndex === s.index;

                  if (isSalient) {
                    return (
                      <span
                        key={s.index}
                        onClick={() => setSelectedSentenceIndex(s.index)}
                        className={`inline cursor-pointer transition-all rounded px-1.5 py-0.5 mx-0.5 ${
                          isSelected
                            ? 'bg-amber-400 text-black font-semibold ring-2 ring-amber-500 shadow-md'
                            : 'bg-amber-400/20 text-light-heading dark:text-dark-heading border-b-2 border-amber-400/80 hover:bg-amber-400/35'
                        }`}
                        title={`Salience Score: ${score}`}
                      >
                        {s.text}{' '}
                      </span>
                    );
                  }

                  return (
                    <span key={s.index} className="inline opacity-85">
                      {s.text}{' '}
                    </span>
                  );
                })
              ) : (
                <p className="text-light-body/50">No document text available for highlighting.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quick Scanning Executive Salient List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ListOrdered className="w-4 h-4 text-amber-500" />
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-light-heading dark:text-dark-heading">
              Rapid Scanning Key Sentences
            </h4>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {salientSentences.length > 0 ? (
              salientSentences.map((item, idx) => {
                const isSelected = selectedSentenceIndex === item.index;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedSentenceIndex(item.index)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 shadow-soft'
                        : 'border-light-border dark:border-dark-border bg-light-surface/60 dark:bg-dark-surface/60 hover:border-amber-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                        Key Point #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300">
                        Score: {item.score}
                      </span>
                    </div>
                    <p className="text-light-heading dark:text-dark-heading font-medium leading-relaxed">
                      "{item.sentence}"
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-light-body/60 p-4 text-center">
                No salient sentences detected.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalientHighlighter;