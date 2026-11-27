import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Layers, Upload, ArrowUp, ArrowDown, Trash2, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { mergePdfs, downloadBlob } from '../../services/toolsService';

export const PdfMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    onDrop: (accepted) => {
      setError(null);
      setFiles((prev) => [...prev, ...accepted]);
    },
  });

  const moveUp = (index) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF documents to merge.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const blob = await mergePdfs(files);
      downloadBlob(blob, `docify-merged-${Date.now()}.pdf`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to merge PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
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
          {isDragActive ? 'Drop your PDFs here' : 'Drop multiple PDF files here, or click to browse'}
        </p>
        <p className="text-xs text-light-body dark:text-dark-body mt-1">
          Add 2 or more PDFs. You can reorder them before merging.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected File List with Reorder Controls */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-light-body dark:text-dark-body pb-1">
            <span>Merge Queue ({files.length} files)</span>
            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-status-danger hover:underline text-[11px]"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="w-6 h-6 rounded-lg bg-accent/10 text-accent-dark dark:text-accent-light flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <FileText className="w-4 h-4 text-light-body dark:text-dark-body shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-light-heading dark:text-dark-heading truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-light-body dark:text-dark-body">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded-lg text-light-body dark:text-dark-body hover:bg-light-bg dark:hover:bg-dark-bg disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === files.length - 1}
                    className="p-1 rounded-lg text-light-body dark:text-dark-body hover:bg-light-bg dark:hover:bg-dark-bg disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 rounded-lg text-status-danger hover:bg-status-danger/10 ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={handleMerge}
              isLoading={isProcessing}
              disabled={files.length < 2}
              leftIcon={Layers}
              rightIcon={Download}
            >
              Merge {files.length} PDFs & Download
            </Button>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Merged PDF downloaded successfully!</span>
        </div>
      )}
    </div>
  );
};

export default PdfMergeTool;
