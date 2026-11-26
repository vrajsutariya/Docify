import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { FilePreview } from './FilePreview';
import { uploadFile, formatBytes } from '../../services/documentService';
import { Button } from '../common/Button';

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tiff'],
};

const FORMAT_PILLS = [
  { label: '.pdf', icon: FileText, category: 'Documents' },
  { label: '.docx', icon: FileText, category: 'Documents' },
  { label: '.txt', icon: FileText, category: 'Plain Text' },
  { label: '.csv', icon: FileSpreadsheet, category: 'Tabular' },
  { label: '.xlsx', icon: FileSpreadsheet, category: 'Excel' },
  { label: '.png', icon: ImageIcon, category: 'Images / OCR' },
  { label: '.jpg', icon: ImageIcon, category: 'Images / OCR' },
];

export const DropZone = ({
  onUploadSuccess,
  onUploadError,
  autoUpload = true,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleUpload = useCallback(
    async (fileToUpload) => {
      if (!fileToUpload) return;

      setIsUploading(true);
      setUploadProgress(0);
      setErrorMessage(null);

      try {
        const response = await uploadFile(fileToUpload, (progress) => {
          setUploadProgress(progress);
        });

        const docData = response?.data || response;
        setUploadedDoc(docData);
        setIsUploading(false);

        if (onUploadSuccess) {
          onUploadSuccess(docData);
        }
      } catch (err) {
        setIsUploading(false);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Upload failed. Please check file format and network connection.';
        setErrorMessage(msg);

        if (onUploadError) {
          onUploadError(err);
        }
      }
    },
    [onUploadSuccess, onUploadError]
  );

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      setErrorMessage(null);

      // Handle Rejections
      if (fileRejections && fileRejections.length > 0) {
        const firstRejection = fileRejections[0];
        const error = firstRejection.errors[0];

        if (error.code === 'file-too-large') {
          setErrorMessage(`File exceeds 25 MB limit (${formatBytes(firstRejection.file.size)}). Please select a smaller file.`);
        } else if (error.code === 'file-invalid-type') {
          setErrorMessage(`Invalid format (${firstRejection.file.name}). Supported: PDF, DOCX, TXT, CSV, XLSX, PNG, JPG.`);
        } else {
          setErrorMessage(error.message || 'File could not be accepted.');
        }
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setUploadedDoc(null);

        if (autoUpload) {
          handleUpload(file);
        }
      }
    },
    [autoUpload, handleUpload]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadedDoc(null);
    setUploadProgress(0);
    setErrorMessage(null);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto space-y-6 ${className}`}>
      {/* Upload Box matching SRS "one clear action per screen, big upload box as main focus" */}
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: isUploading ? 1 : 1.008 }}
        whileTap={{ scale: isUploading ? 1 : 0.995 }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragActive
            ? 'border-brand-red dark:border-brand-redBright bg-brand-red/5 dark:bg-brand-red/10 shadow-glow-red animate-pulse-glow'
            : isDragReject
            ? 'border-status-error bg-status-error/10'
            : 'border-light-border dark:border-dark-border hover:border-brand-red dark:hover:border-brand-redBright bg-light-surface/40 dark:bg-dark-surface/40 hover:bg-light-surface/70 dark:hover:bg-dark-surface/70 hover:shadow-glow-red'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Pulsing Animated Cloud Icon */}
          <motion.div
            animate={
              isDragActive
                ? { y: [-4, 4, -4], scale: 1.15 }
                : { y: 0, scale: 1 }
            }
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className={`p-4 sm:p-5 rounded-2xl ${
              isDragActive
                ? 'bg-gradient-to-tr from-brand-red to-brand-orange text-white shadow-glow-red'
                : 'bg-light-surface dark:bg-dark-surface text-brand-red dark:text-brand-redBright border border-light-border dark:border-dark-border group-hover:scale-105'
            }`}
          >
            <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12" />
          </motion.div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-light-heading dark:text-dark-heading">
              {isDragActive
                ? 'Drop your document here now'
                : 'Drag & Drop your document here, or click to browse'}
            </h3>
            <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
              Supports digital PDFs, Word docs, scanned images with Gujarati/Hindi OCR, and data sheets up to <strong className="text-brand-red dark:text-brand-redBright font-semibold">25 MB</strong>
            </p>
          </div>

          {/* Supported Format Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-lg">
            {FORMAT_PILLS.map((pill) => {
              const Icon = pill.icon;
              return (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-brand-red dark:hover:border-brand-redBright transition-colors"
                >
                  <Icon className="w-3 h-3 text-brand-red dark:text-brand-orangeBright" />
                  {pill.label}
                </span>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/30 flex items-center gap-2.5 text-xs text-status-error"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected File / Upload Progress / Document Preview Card */}
      <AnimatePresence>
        {(selectedFile || uploadedDoc) && (
          <FilePreview
            file={selectedFile}
            document={uploadedDoc}
            progress={uploadProgress}
            uploading={isUploading}
            error={errorMessage}
            onRemove={handleRemove}
            onProcess={
              !autoUpload && selectedFile && !uploadedDoc && !isUploading
                ? () => handleUpload(selectedFile)
                : null
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropZone;
