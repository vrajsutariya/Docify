import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Scissors, Upload, FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { splitPdf, downloadBlob } from '../../services/toolsService';

export const PdfSplitTool = () => {
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState('1-3');
  const [splitMode, setSplitMode] = useState('ranges'); // 'ranges' | 'all'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: (accepted) => {
      if (accepted[0]) {
        setFile(accepted[0]);
        setError(null);
        setSuccess(false);
      }
    },
  });

  const handleSplit = async () => {
    if (!file) {
      setError('Please upload a PDF file to split.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const blob = await splitPdf(file, {
        ranges: splitMode === 'ranges' ? ranges : undefined,
      });
      downloadBlob(blob, `docify-split-${Date.now()}.pdf`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to split PDF. Please check page ranges.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-accent bg-accent/5'
              : 'border-light-border dark:border-dark-border hover:border-accent hover:bg-light-surface/60 dark:hover:bg-dark-surface/60'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent-dark dark:text-accent-light mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="font-heading font-semibold text-sm text-light-heading dark:text-dark-heading">
            Drop your PDF to split, or click to browse
          </p>
          <p className="text-xs text-light-body dark:text-dark-body mt-1">
            Specify page ranges (e.g. 1-3, 5, 7-10) to extract
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 truncate">
              <FileText className="w-5 h-5 text-accent-dark dark:text-accent-light shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-light-heading dark:text-dark-heading truncate">
                  {file.name}
                </p>
                <p className="text-[11px] text-light-body dark:text-dark-body">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs text-status-danger hover:underline font-semibold"
            >
              Change file
            </button>
          </div>

          {/* Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading block">
              Split Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplitMode('ranges')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  splitMode === 'ranges'
                    ? 'border-accent bg-accent/10 text-light-heading dark:text-dark-heading'
                    : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-body dark:text-dark-body'
                }`}
              >
                Custom Ranges
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                  e.g. 1-3, 5, 8-12
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  splitMode === 'all'
                    ? 'border-accent bg-accent/10 text-light-heading dark:text-dark-heading'
                    : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-body dark:text-dark-body'
                }`}
              >
                First Page / Preview
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                  Extract cover / intro
                </span>
              </button>
            </div>
          </div>

          {splitMode === 'ranges' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Page Range Expression
              </label>
              <input
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-10"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              />
              <p className="text-[11px] text-light-body dark:text-dark-body">
                Separate individual pages with commas or ranges with hyphens.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Extracted pages downloaded successfully!</span>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={handleSplit}
            isLoading={isProcessing}
            leftIcon={Scissors}
            rightIcon={Download}
          >
            Extract & Download Split PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfSplitTool;
