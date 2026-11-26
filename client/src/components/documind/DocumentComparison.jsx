import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  GitCompare,
  FileText,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  Scale,
  RefreshCw,
  Plus,
  Minus,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const DocumentComparison = ({
  userDocuments = [],
  activeDocId,
  onCompare,
}) => {
  const [docAId, setDocAId] = useState(activeDocId || '');
  const [docBId, setDocBId] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);

  // Sync scroll refs
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const isSyncingScroll = useRef(false);

  // Auto-select second document if user has multiple docs
  useEffect(() => {
    if (activeDocId) {
      setDocAId(activeDocId);
    }
    if (userDocuments.length > 1 && !docBId) {
      const otherDoc = userDocuments.find((d) => d._id !== activeDocId);
      if (otherDoc) setDocBId(otherDoc._id);
    }
  }, [activeDocId, userDocuments, docBId]);

  // Synchronized scrolling handler
  const handleScroll = (sourcePane) => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    if (sourcePane === 'left' && leftPaneRef.current && rightPaneRef.current) {
      rightPaneRef.current.scrollTop = leftPaneRef.current.scrollTop;
    } else if (sourcePane === 'right' && leftPaneRef.current && rightPaneRef.current) {
      leftPaneRef.current.scrollTop = rightPaneRef.current.scrollTop;
    }

    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const handleRunComparison = useCallback(async () => {
    if (!docAId || !docBId) {
      setError('Please select two documents to compare.');
      return;
    }
    if (docAId === docBId) {
      setError('Please select two distinct documents for comparison.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (onCompare) {
        const res = await onCompare(docAId, docBId);
        setComparisonResult(res?.data || res || null);
      }
    } catch (err) {
      console.error('Error comparing documents:', err);
      setError(err.message || 'Failed to compare documents.');
    } finally {
      setLoading(false);
    }
  }, [docAId, docBId, onCompare]);

  // Trigger comparison when both doc IDs are available
  useEffect(() => {
    if (docAId && docBId && docAId !== docBId && !comparisonResult) {
      handleRunComparison();
    }
  }, [docAId, docBId, handleRunComparison, comparisonResult]);

  // Swap Document A and Document B
  const handleSwap = () => {
    const temp = docAId;
    setDocAId(docBId);
    setDocBId(temp);
    setComparisonResult(null);
  };

  // Build aligned side-by-side lines from diff
  const { leftLines, rightLines } = React.useMemo(() => {
    if (!comparisonResult?.diff) return { leftLines: [], rightLines: [] };

    const left = [];
    const right = [];

    comparisonResult.diff.forEach((part) => {
      const rawLines = part.value.split('\n');
      // If trailing empty string from trailing \n, drop only if multi-line
      if (rawLines.length > 1 && rawLines[rawLines.length - 1] === '') {
        rawLines.pop();
      }

      rawLines.forEach((line) => {
        if (part.type === 'deleted') {
          left.push({ type: 'deleted', text: line });
        } else if (part.type === 'added') {
          right.push({ type: 'added', text: line });
        } else {
          // unchanged in both
          left.push({ type: 'unchanged', text: line });
          right.push({ type: 'unchanged', text: line });
        }
      });
    });

    return { leftLines: left, rightLines: right };
  }, [comparisonResult]);

  return (
    <div className="space-y-6">
      {/* Document Selectors Header */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Doc A Selector */}
          <div className="w-full md:w-5/12 space-y-1.5">
            <label className="text-xs font-semibold text-light-body dark:text-dark-body flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-orange" />
              Document A (Original / Baseline)
            </label>
            <select
              value={docAId}
              onChange={(e) => {
                setDocAId(e.target.value);
                setComparisonResult(null);
              }}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select Baseline Document</option>
              {userDocuments.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.originalName} ({doc.pageCount || 1} pg)
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:bg-light-border/40 dark:hover:bg-dark-border/40 text-light-body dark:text-dark-body hover:text-brand-orange transition-colors"
              title="Swap Document A and B"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Doc B Selector */}
          <div className="w-full md:w-5/12 space-y-1.5">
            <label className="text-xs font-semibold text-light-body dark:text-dark-body flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent" />
              Document B (Revised / Target)
            </label>
            <select
              value={docBId}
              onChange={(e) => {
                setDocBId(e.target.value);
                setComparisonResult(null);
              }}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select Revised Document</option>
              {userDocuments.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.originalName} ({doc.pageCount || 1} pg)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            onClick={handleRunComparison}
            isLoading={loading}
            disabled={!docAId || !docBId || docAId === docBId}
            leftIcon={GitCompare}
            className="bg-brand-gradient text-white"
          >
            Compare Documents
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-status-error/40 bg-status-error/5 text-status-error text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </Card>
      )}

      {/* Comparison Statistics & Plagiarism Banner */}
      {comparisonResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: Similarity % */}
            <Card className="p-4 space-y-1 border-light-border dark:border-dark-border">
              <span className="text-[11px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                Similarity Score
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold font-heading ${
                    comparisonResult.similarityScore > 80
                      ? 'text-status-success'
                      : comparisonResult.similarityScore > 45
                      ? 'text-status-warning'
                      : 'text-accent'
                  }`}
                >
                  {comparisonResult.similarityScore}%
                </span>
                <span className="text-[10px] text-light-body dark:text-dark-body">
                  ({comparisonResult.cosineSimilarity}% Cosine)
                </span>
              </div>
            </Card>

            {/* Metric 2: Verbatim / Exact N-Grams (Plagiarism Detector) */}
            <Card className="p-4 space-y-1 border-light-border dark:border-dark-border">
              <span className="text-[11px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-brand-orange" />
                Exact Phrasing Match
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-brand-orange">
                  {comparisonResult.tokenOverlap || 0}%
                </span>
                <span className="text-[10px] text-light-body dark:text-dark-body">4-Gram Token</span>
              </div>
            </Card>

            {/* Metric 3: Added Lines */}
            <Card className="p-4 space-y-1 border-light-border dark:border-dark-border">
              <span className="text-[11px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-status-success" />
                Added Lines
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-status-success">
                  +{comparisonResult.addedLinesCount || 0}
                </span>
                <span className="text-[10px] text-light-body dark:text-dark-body">in Doc B</span>
              </div>
            </Card>

            {/* Metric 4: Deleted Lines */}
            <Card className="p-4 space-y-1 border-light-border dark:border-dark-border">
              <span className="text-[11px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider flex items-center gap-1.5">
                <Minus className="w-3.5 h-3.5 text-status-error" />
                Deleted Lines
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-status-error">
                  -{comparisonResult.deletedLinesCount || 0}
                </span>
                <span className="text-[10px] text-light-body dark:text-dark-body">from Doc A</span>
              </div>
            </Card>
          </div>

          {/* AI Semantic Synthesis Insight */}
          {comparisonResult.aiSummary && (
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-accent font-heading">
                  AI Comparative Analysis & Version Highlights
                </h4>
                <p className="text-xs text-light-body dark:text-dark-body leading-relaxed">
                  {comparisonResult.aiSummary}
                </p>
              </div>
            </div>
          )}

          {/* Synchronized Side-by-Side Dual-Pane Diff View */}
          <Card className="p-0 overflow-hidden border-light-border dark:border-dark-border">
            {/* Headers */}
            <div className="grid grid-cols-2 border-b border-light-border dark:border-dark-border bg-light-surface/80 dark:bg-dark-surface/80">
              <div className="p-3 border-r border-light-border dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold font-heading text-light-heading dark:text-dark-heading truncate">
                  Original: {comparisonResult.docA?.name || 'Document A'}
                </span>
                <span className="text-[10px] text-status-error font-mono bg-status-error/10 px-2 py-0.5 rounded-full">
                  Deletions / Baseline
                </span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs font-bold font-heading text-light-heading dark:text-dark-heading truncate">
                  Revised: {comparisonResult.docB?.name || 'Document B'}
                </span>
                <span className="text-[10px] text-status-success font-mono bg-status-success/10 px-2 py-0.5 rounded-full">
                  Insertions / Updates
                </span>
              </div>
            </div>

            {/* Split Screen Diff Body */}
            <div className="grid grid-cols-2 divide-x divide-light-border dark:divide-dark-border font-mono text-xs max-h-[500px]">
              {/* Left Pane (Document A) */}
              <div
                ref={leftPaneRef}
                onScroll={() => handleScroll('left')}
                className="overflow-y-auto p-3 space-y-1 bg-light-surface/20 dark:bg-dark-surface/20 select-text"
              >
                {leftLines.length > 0 ? (
                  leftLines.map((line, idx) => (
                    <div
                      key={`l-${idx}`}
                      className={`flex items-start gap-2 px-2 py-0.5 rounded leading-relaxed ${
                        line.type === 'deleted'
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400 font-medium'
                          : 'text-light-body dark:text-dark-body'
                      }`}
                    >
                      <span className="w-6 text-[10px] text-light-body/40 dark:text-dark-body/40 select-none text-right shrink-0">
                        {idx + 1}
                      </span>
                      <span className="shrink-0 select-none font-bold text-red-500 w-3">
                        {line.type === 'deleted' ? '-' : ' '}
                      </span>
                      <span className="break-words whitespace-pre-wrap">{line.text || '\u00A0'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-light-body dark:text-dark-body p-4 text-center">
                    No text content available in Document A.
                  </p>
                )}
              </div>

              {/* Right Pane (Document B) */}
              <div
                ref={rightPaneRef}
                onScroll={() => handleScroll('right')}
                className="overflow-y-auto p-3 space-y-1 bg-light-surface/20 dark:bg-dark-surface/20 select-text"
              >
                {rightLines.length > 0 ? (
                  rightLines.map((line, idx) => (
                    <div
                      key={`r-${idx}`}
                      className={`flex items-start gap-2 px-2 py-0.5 rounded leading-relaxed ${
                        line.type === 'added'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-light-body dark:text-dark-body'
                      }`}
                    >
                      <span className="w-6 text-[10px] text-light-body/40 dark:text-dark-body/40 select-none text-right shrink-0">
                        {idx + 1}
                      </span>
                      <span className="shrink-0 select-none font-bold text-emerald-500 w-3">
                        {line.type === 'added' ? '+' : ' '}
                      </span>
                      <span className="break-words whitespace-pre-wrap">{line.text || '\u00A0'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-light-body dark:text-dark-body p-4 text-center">
                    No text content available in Document B.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentComparison;