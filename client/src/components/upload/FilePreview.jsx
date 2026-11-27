import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Clock,
  BookOpen,
  Languages,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DocifyLoadingBar } from '../common/DocifyLoadingBar';
import { formatBytes } from '../../services/documentService';

export const getFileIcon = (fileName = '', mimeType = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'pdf' || mimeType.includes('pdf')) {
    return { icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10 dark:bg-red-500/20', label: 'PDF' };
  }
  if (['docx', 'doc'].includes(ext) || mimeType.includes('word')) {
    return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10 dark:bg-blue-500/20', label: 'DOCX' };
  }
  if (['csv', 'xlsx', 'xls'].includes(ext) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return { icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', label: 'SHEET' };
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'tiff'].includes(ext) || mimeType.startsWith('image/')) {
    return { icon: ImageIcon, color: 'text-amber-500', bg: 'bg-amber-500/10 dark:bg-amber-500/20', label: 'IMAGE' };
  }
  if (ext === 'txt' || mimeType.includes('plain')) {
    return { icon: FileCode, color: 'text-cyan-500', bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', label: 'TXT' };
  }

  return { icon: File, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'FILE' };
};

export const FilePreview = ({
  file,
  document,
  progress = 0,
  uploading = false,
  error = null,
  onRemove,
  onProcess,
  onView,
  className = '',
}) => {
  const target = document || file;
  if (!target) return null;

  const fileName = document?.originalName || file?.name || 'Uploaded Document';
  const fileSize = document?.fileSize || file?.size || 0;
  const mimeType = document?.mimeType || file?.type || '';
  const { icon: FileIcon, color, bg, label } = getFileIcon(fileName, mimeType);

  const isComplete = !uploading && !error && (progress === 100 || document);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon & Name */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className={`p-3 rounded-xl shrink-0 ${bg} ${color}`}>
            <FileIcon className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-heading font-semibold text-sm sm:text-base text-light-heading dark:text-dark-heading truncate max-w-sm sm:max-w-md" title={fileName}>
                {fileName}
              </h4>
              <Badge variant="neutral" size="sm" className="text-[10px] uppercase font-mono font-bold">
                {label}
              </Badge>
              {document?.ocrProcessed && (
                <Badge variant="brand" size="sm" icon={Sparkles} className="text-[10px]">
                  OCR Extracted
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-light-body dark:text-dark-body">
              <span>{formatBytes(fileSize)}</span>

              {document?.pageCount && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-accent-dark dark:text-accent-light" />
                    {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </>
              )}

              {document?.wordCount !== undefined && document.wordCount > 0 && (
                <>
                  <span>•</span>
                  <span>{document.wordCount.toLocaleString()} words</span>
                </>
              )}

              {document?.readingTimeMinutes && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    ~{document.readingTimeMinutes} min read
                  </span>
                </>
              )}

              {document?.detectedLanguage && document.detectedLanguage !== 'unknown' && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 uppercase font-mono font-semibold text-[11px] text-accent-dark dark:text-accent-light">
                    <Languages className="w-3.5 h-3.5" />
                    {document.detectedLanguage === 'gu'
                      ? 'Gujarati'
                      : document.detectedLanguage === 'hi'
                      ? 'Hindi'
                      : 'English'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Remove button (if not currently uploading) */}
        {onRemove && !uploading && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-light-body hover:text-brand-red dark:text-dark-body dark:hover:text-brand-redBright hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
            title="Remove file"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload & AI Processing Progress Bar with Docify Logo */}
      {uploading && (
        <div className="mt-4 p-3.5 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20">
          <DocifyLoadingBar
            progress={progress < 100 ? progress : undefined}
            label={
              progress < 100
                ? `Uploading document (${progress}%)...`
                : 'Docify Engine: Extracting text & neural embeddings...'
            }
            sublabel={
              progress < 100
                ? 'Streaming secure file payload'
                : 'Processing OCR, page coordinates, and 3-level abstractions'
            }
            size="md"
            showLogo={true}
            showPercentage={progress < 100}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-2.5 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center gap-2 text-xs text-status-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{typeof error === 'string' ? error : error.message || 'Upload failed'}</span>
        </div>
      )}

      {/* Success Badge & Action Footer */}
      {(onProcess || onView || isComplete) && !uploading && !error && (
        <div className="mt-4 pt-3 border-t border-light-border/70 dark:border-dark-border/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-status-success font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready for AI Processing</span>
          </div>

          <div className="flex items-center gap-2">
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-xs text-light-body hover:text-brand-red dark:text-dark-body dark:hover:text-brand-redBright"
              >
                Remove / Replace
              </Button>
            )}

            {onProcess && (
              <Button
                variant="primary"
                size="sm"
                onClick={onProcess}
                leftIcon={Sparkles}
                className="bg-brand-gradient text-xs shadow-glow-cyan"
              >
                Process Document
              </Button>
            )}

            {onView && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onView}
                leftIcon={Eye}
                className="text-xs"
              >
                Inspect Details
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FilePreview;
