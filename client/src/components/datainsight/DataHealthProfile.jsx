import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Table,
  Copy,
  Hash,
  Type,
  Calendar,
  Layers,
  Wand2,
  RefreshCw,
  History,
  X,
  FileCheck,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const DataHealthProfile = ({
  dataset,
  onClean,
  cleaning = false,
}) => {
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [cleanOptions, setCleanOptions] = useState({
    removeDuplicates: true,
    handleMissingValues: 'mean_median', // 'mean_median' | 'drop' | 'none'
    trimStrings: true,
    normalizeDates: true,
  });
  const [cleanDiff, setCleanDiff] = useState(null);

  if (!dataset) return null;

  const {
    rowCount = 0,
    columnCount = 0,
    columns = [],
    summaryStats = {},
    cleaningHistory = [],
  } = dataset;

  const {
    missingCellsCount = 0,
    totalCellsCount = 0,
    duplicateRowsCount = 0,
    qualityScore = 100,
  } = summaryStats;

  // Quality score color
  const getQualityColor = (score) => {
    if (score >= 90) return 'text-status-success';
    if (score >= 70) return 'text-status-warning';
    return 'text-status-error';
  };

  const getQualityBadge = (score) => {
    if (score >= 90) return 'Healthy & Production-Ready';
    if (score >= 70) return 'Needs Cleaning (Minor Nulls/Dups)';
    return 'Action Required (High Nulls/Dups)';
  };

  const handleExecuteClean = async () => {
    if (!onClean) return;
    const res = await onClean(cleanOptions);
    if (res?.data) {
      setCleanDiff({
        before: res.data.beforeStats,
        after: res.data.afterStats,
        actionsTaken: res.data.actionsTaken || [],
      });
      setShowCleanModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Overall Quality Score & 1-Click Auto-Clean Button */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-light-surface via-light-surface/90 to-accent/5 dark:from-dark-surface dark:via-dark-surface/90 dark:to-accent/10 border border-light-border dark:border-dark-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-light-surface/80 dark:bg-dark-surface/80 border border-light-border dark:border-dark-border shadow-inner">
            <span className={`text-2xl font-heading font-extrabold ${getQualityColor(qualityScore)}`}>
              {qualityScore}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading">
                Data Quality Health Score
              </h3>
              <Badge variant={qualityScore >= 85 ? 'success' : 'warning'} size="sm">
                {getQualityBadge(qualityScore)}
              </Badge>
            </div>
            <p className="text-xs text-light-body dark:text-dark-body max-w-lg">
              Automated audit of schema data types, missing cell density, row duplicates, and statistical bounds.
            </p>
          </div>
        </div>

        <Button
          size="md"
          variant="primary"
          leftIcon={Wand2}
          isLoading={cleaning}
          onClick={() => setShowCleanModal(true)}
          className="bg-brand-gradient shadow-glow-cyan text-white whitespace-nowrap"
        >
          One-Click Auto-Clean
        </Button>
      </div>

      {/* Before / After Cleaning Diff Banner if recently cleaned */}
      <AnimatePresence>
        {cleanDiff && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-status-success/10 border border-status-success/30 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-status-success font-heading">
                  Dataset Successfully Cleaned!
                </h4>
                <div className="text-xs text-light-body dark:text-dark-body space-y-0.5">
                  <p>
                    Quality Score improved from <strong>{cleanDiff.before?.qualityScore}%</strong> to{' '}
                    <strong className="text-status-success">{cleanDiff.after?.qualityScore}%</strong>.
                  </p>
                  <ul className="list-disc pl-4 text-[11px] text-light-body/80 dark:text-dark-body/80 space-y-0.5">
                    {cleanDiff.actionsTaken.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCleanDiff(null)}
              className="text-light-body/50 hover:text-light-body"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Rows */}
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-accent" />
            Total Rows
          </span>
          <p className="text-2xl font-heading font-bold text-light-heading dark:text-dark-heading">
            {rowCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-light-body/60">Across all records</span>
        </Card>

        {/* Total Columns */}
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-orange" />
            Total Columns
          </span>
          <p className="text-2xl font-heading font-bold text-light-heading dark:text-dark-heading">
            {columnCount}
          </p>
          <span className="text-[10px] text-light-body/60">
            {columns.filter((c) => c.type === 'numeric').length} numeric, {columns.filter((c) => c.type === 'string').length} text
          </span>
        </Card>

        {/* Missing Cells */}
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body flex items-center gap-1.5">
            <AlertTriangle className={`w-3.5 h-3.5 ${missingCellsCount > 0 ? 'text-status-warning' : 'text-status-success'}`} />
            Missing / Null Cells
          </span>
          <p className={`text-2xl font-heading font-bold ${missingCellsCount > 0 ? 'text-status-warning' : 'text-status-success'}`}>
            {missingCellsCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-light-body/60">
            {totalCellsCount > 0 ? ((missingCellsCount / totalCellsCount) * 100).toFixed(1) : 0}% of all cells
          </span>
        </Card>

        {/* Duplicate Rows */}
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-light-body dark:text-dark-body flex items-center gap-1.5">
            <Copy className={`w-3.5 h-3.5 ${duplicateRowsCount > 0 ? 'text-status-error' : 'text-status-success'}`} />
            Duplicate Rows
          </span>
          <p className={`text-2xl font-heading font-bold ${duplicateRowsCount > 0 ? 'text-status-error' : 'text-status-success'}`}>
            {duplicateRowsCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-light-body/60">Exact identical records</span>
        </Card>
      </div>

      {/* Detailed Columns Profiling Breakdown */}
      <Card className="p-0 overflow-hidden border-light-border dark:border-dark-border">
        <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h4 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-orange" />
            Column Schema & Statistical Distributions
          </h4>
          <span className="text-[10px] text-light-body dark:text-dark-body font-mono">
            {columns.length} Identified Fields
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border bg-light-surface/60 dark:bg-dark-surface/60 text-[11px] font-heading font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Null Count</th>
                <th className="py-3 px-4">Unique Values</th>
                <th className="py-3 px-4">Min / Max</th>
                <th className="py-3 px-4">Mean / Median</th>
                <th className="py-3 px-4">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {columns.map((col) => (
                <tr key={col.name} className="hover:bg-light-surface/40 dark:hover:bg-dark-surface/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-light-heading dark:text-dark-heading">
                    {col.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-light-border/40 dark:bg-dark-border/40 capitalize">
                      {col.type === 'numeric' ? <Hash className="w-3 h-3 text-brand-orange" /> : <Type className="w-3 h-3 text-light-body" />}
                      {col.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={col.nullCount > 0 ? 'text-status-warning font-semibold' : 'text-light-body/60'}>
                      {col.nullCount} {col.nullCount > 0 && `(${((col.nullCount / (rowCount || 1)) * 100).toFixed(1)}%)`}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{col.uniqueCount}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {col.type === 'numeric' && col.min !== null ? `${col.min} / ${col.max}` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {col.type === 'numeric' && col.mean !== null ? `${col.mean} (avg)` : '—'}
                  </td>
                  <td className="py-3 px-4 text-light-body/80 truncate max-w-xs text-[11px]">
                    {(col.sampleValues || []).slice(0, 3).join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cleaning History Timeline if present */}
      {cleaningHistory.length > 0 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-light-border dark:border-dark-border">
            <History className="w-4 h-4 text-accent" />
            <h4 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading">
              Data Cleaning History & Audit Trail
            </h4>
          </div>

          <div className="space-y-2">
            {cleaningHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-status-success" />
                  <div>
                    <p className="font-semibold text-light-heading dark:text-dark-heading">{item.action}</p>
                    <p className="text-[11px] text-light-body dark:text-dark-body">{item.details}</p>
                  </div>
                </div>
                <span className="text-[10px] text-light-body/60 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* One-Click Auto-Clean Configuration Modal */}
      {showCleanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-accent" />
                <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                  One-Click Auto-Clean Pipeline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCleanModal(false)}
                className="p-1 rounded-lg text-light-body hover:text-light-heading"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-light-body dark:text-dark-body leading-relaxed">
              Configure automated transformations to resolve missing data and deduplicate records without damaging dataset integrity.
            </p>

            <div className="space-y-3 text-xs">
              {/* Option 1: Remove duplicate rows */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanOptions.removeDuplicates}
                  onChange={(e) => setCleanOptions({ ...cleanOptions, removeDuplicates: e.target.checked })}
                  className="rounded text-accent focus:ring-accent mt-0.5"
                />
                <div>
                  <span className="font-semibold text-light-heading dark:text-dark-heading block">
                    Remove Duplicate Records
                  </span>
                  <span className="text-[11px] text-light-body dark:text-dark-body">
                    Eliminates exact identical rows ({duplicateRowsCount} found).
                  </span>
                </div>
              </label>

              {/* Option 2: Missing values treatment */}
              <div className="p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 space-y-2">
                <span className="font-semibold text-light-heading dark:text-dark-heading block">
                  Missing Values Handling
                </span>
                <div className="space-y-1.5 pl-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="missingVal"
                      value="mean_median"
                      checked={cleanOptions.handleMissingValues === 'mean_median'}
                      onChange={() => setCleanOptions({ ...cleanOptions, handleMissingValues: 'mean_median' })}
                      className="text-accent"
                    />
                    <span>Impute numbers with column median & text with mode (Recommended)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="missingVal"
                      value="drop"
                      checked={cleanOptions.handleMissingValues === 'drop'}
                      onChange={() => setCleanOptions({ ...cleanOptions, handleMissingValues: 'drop' })}
                      className="text-accent"
                    />
                    <span>Drop any row with missing cells</span>
                  </label>
                </div>
              </div>

              {/* Option 3: String trimming */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanOptions.trimStrings}
                  onChange={(e) => setCleanOptions({ ...cleanOptions, trimStrings: e.target.checked })}
                  className="rounded text-accent focus:ring-accent mt-0.5"
                />
                <div>
                  <span className="font-semibold text-light-heading dark:text-dark-heading block">
                    Trim & Normalize Text
                  </span>
                  <span className="text-[11px] text-light-body dark:text-dark-body">
                    Removes leading/trailing whitespace and redundant double spaces.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={() => setShowCleanModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={Wand2}
                isLoading={cleaning}
                onClick={handleExecuteClean}
                className="bg-brand-gradient text-white"
              >
                Execute Auto-Clean
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DataHealthProfile;
