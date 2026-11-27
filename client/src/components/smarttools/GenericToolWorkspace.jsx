import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  RotateCw,
  Lock,
  Unlock,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Archive,
  Scan,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  FileCode,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  rotatePdf,
  protectPdf,
  unlockPdf,
  addPageNumbers,
  cropPdf,
  batchRenameAndZip,
  ocrExtract,
  downloadBlob,
} from '../../services/toolsService';

export const GenericToolWorkspace = ({ toolId }) => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Security (Protect / Unlock) Parameters
  const [securityMode, setSecurityMode] = useState('protect'); // 'protect' | 'unlock'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // File Renamer Parameters
  const [newFileName, setNewFileName] = useState('');
  const [renamePrefix, setRenamePrefix] = useState('');
  const [renameSuffix, setRenameSuffix] = useState('');

  // Rotation, Page Numbers, Cropping & OCR Parameters
  const [rotateAngle, setRotateAngle] = useState(90);
  const [pagePosition, setPagePosition] = useState('bottom-center');
  const [pageFormat, setPageFormat] = useState('Page {n} of {total}');
  const [cropMargins, setCropMargins] = useState({ top: 30, right: 30, bottom: 30, left: 30 });
  const [ocrLanguage, setOcrLanguage] = useState('eng');

  const isMultiFile = toolId === 'bulk-zip-download' || toolId === 'bulk-rename-zip';

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: isMultiFile,
    onDrop: (accepted) => {
      setFiles(accepted);
      setError(null);
      setSuccess(false);
      setResultData(null);
    },
  });

  const handleExecute = async () => {
    if (files.length === 0) {
      setError('Please upload the required file(s).');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      if (toolId === 'protect-unlock-pdf' || toolId === 'protect-pdf' || toolId === 'unlock-pdf') {
        const mode = toolId === 'unlock-pdf' ? 'unlock' : toolId === 'protect-pdf' ? 'protect' : securityMode;
        if (!password.trim()) {
          throw new Error(
            mode === 'protect'
              ? 'Please enter the password you want to set for this PDF.'
              : 'Please enter the password required to unlock this PDF.'
          );
        }

        if (mode === 'protect') {
          const blob = await protectPdf(files[0], password.trim());
          const cleanName = files[0].name.replace(/\.[^/.]+$/, '');
          downloadBlob(blob, `${cleanName}-protected.pdf`);
          setSuccess(true);
        } else {
          const blob = await unlockPdf(files[0], password.trim());
          const cleanName = files[0].name.replace(/\.[^/.]+$/, '');
          downloadBlob(blob, `${cleanName}-unlocked.pdf`);
          setSuccess(true);
        }
      } else if (toolId === 'rotate-pdf') {
        const blob = await rotatePdf(files[0], { globalAngle: rotateAngle });
        downloadBlob(blob, `docify-rotated-${Date.now()}.pdf`);
        setSuccess(true);
      } else if (toolId === 'page-numbers') {
        const blob = await addPageNumbers(files[0], {
          position: pagePosition,
          format: pageFormat,
        });
        downloadBlob(blob, `docify-numbered-${Date.now()}.pdf`);
        setSuccess(true);
      } else if (toolId === 'crop-pdf') {
        const blob = await cropPdf(files[0], cropMargins);
        downloadBlob(blob, `docify-cropped-${Date.now()}.pdf`);
        setSuccess(true);
      } else if (toolId === 'file-renamer') {
        const file = files[0];
        const chosenName = newFileName.trim();
        if (!chosenName && !renamePrefix && !renameSuffix) {
          throw new Error('Please enter a new file name.');
        }
        const dotIndex = file.name.lastIndexOf('.');
        const ext = dotIndex !== -1 ? file.name.slice(dotIndex) : '';
        const originalBase = dotIndex !== -1 ? file.name.slice(0, dotIndex) : file.name;
        const base = chosenName || originalBase;
        const finalDownloadName = `${renamePrefix}${base}${renameSuffix}${ext}`;
        downloadBlob(file, finalDownloadName);
        setSuccess(true);
      } else if (toolId === 'bulk-zip-download' || toolId === 'bulk-rename-zip') {
        const chosenName = newFileName.trim();
        const zipArchiveName = chosenName ? `${chosenName}.zip` : `docify-archive-${Date.now()}.zip`;
        const blob = await batchRenameAndZip(files, {
          customName: chosenName,
          prefix: renamePrefix,
          suffix: renameSuffix,
        });
        downloadBlob(blob, zipArchiveName);
        setSuccess(true);
      } else if (toolId === 'ocr-tool' || toolId === 'image-to-text') {
        const res = await ocrExtract(files[0], ocrLanguage);
        const data = res?.data || res;
        setResultData(data);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Action failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyResultText = () => {
    if (!resultData?.text) return;
    navigator.clipboard.writeText(resultData.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOcrAsTxt = () => {
    if (!resultData?.text) return;
    const blob = new Blob([resultData.text], { type: 'text/plain;charset=utf-8' });
    const originalName = files[0]?.name?.replace(/\.[^/.]+$/, '') || 'ocr-extracted';
    downloadBlob(blob, `${originalName}-extracted.txt`);
  };

  const downloadOcrAsDocx = () => {
    if (!resultData?.text) return;
    // Download as Word-compatible HTML doc
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Docify OCR Document</title></head>
      <body style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; margin: 40px;">
        <h2 style="color: #06B6D4;">Docify Multilingual OCR Document</h2>
        <p style="color: #64748B; font-size: 9pt;">Extracted using Docify OCR Intelligence</p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 15px 0 25px 0;" />
        <div style="white-space: pre-wrap;">${resultData.text}</div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const originalName = files[0]?.name?.replace(/\.[^/.]+$/, '') || 'ocr-extracted';
    downloadBlob(blob, `${originalName}-extracted.doc`);
  };

  // Preview helper for File Renamer
  const getRenamedPreview = () => {
    if (files.length === 0) return null;
    const file = files[0];
    const dotIndex = file.name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? file.name.slice(dotIndex) : '';
    const originalBase = dotIndex !== -1 ? file.name.slice(0, dotIndex) : file.name;
    const base = newFileName.trim() || originalBase;
    const finalFirst = `${renamePrefix}${base}${renameSuffix}${files.length > 1 ? '_1' : ''}${ext}`;
    return finalFirst;
  };

  return (
    <div className="space-y-5">
      {/* 1. PROTECT & UNLOCK PDF WORKSPACE */}
      {(toolId === 'protect-unlock-pdf' || toolId === 'protect-pdf' || toolId === 'unlock-pdf') && (
        <div className="space-y-4 p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          {/* Operation Mode Tabs */}
          {toolId === 'protect-unlock-pdf' && (
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
              <button
                type="button"
                onClick={() => {
                  setSecurityMode('protect');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  securityMode === 'protect'
                    ? 'bg-accent text-black font-bold shadow-sm'
                    : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Protect PDF (Set Password)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSecurityMode('unlock');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  securityMode === 'unlock'
                    ? 'bg-accent text-black font-bold shadow-sm'
                    : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock PDF (Remove Password)</span>
              </button>
            </div>
          )}

          {/* Password Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-light-heading dark:text-dark-heading flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                {securityMode === 'protect'
                  ? 'Set PDF Password (Required)'
                  : 'Enter Password to Unlock PDF'}
              </label>
              <span className="text-[11px] text-accent-dark dark:text-accent-light font-medium">
                {securityMode === 'protect' ? 'AES-256 Encryption' : 'Clean Decryption'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  securityMode === 'protect'
                    ? 'Enter the password you want to set for your PDF...'
                    : 'Enter the password that was set on this PDF...'
                }
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-light-body dark:text-dark-body leading-relaxed">
              {securityMode === 'protect'
                ? 'Your PDF will be protected with AES-256 standard encryption. Anyone opening the file in Adobe Acrobat or browser will be prompted to enter this password.'
                : 'Enter the existing document password to permanently remove restrictions and save a decrypted version.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. FILE RENAMER WORKSPACE */}
      {toolId === 'file-renamer' && (
        <div className="space-y-3.5 p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-light-heading dark:text-dark-heading flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent-dark dark:text-accent-light" />
              New File Name
            </label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. Docify_Final_Report_2026"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-[11px] text-light-body dark:text-dark-body">
              Type your desired new file name. The original extension (e.g., .pdf, .docx, .png) is preserved automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Optional Prefix
              </label>
              <input
                type="text"
                value={renamePrefix}
                onChange={(e) => setRenamePrefix(e.target.value)}
                placeholder="e.g. Final_"
                className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Optional Suffix
              </label>
              <input
                type="text"
                value={renameSuffix}
                onChange={(e) => setRenameSuffix(e.target.value)}
                placeholder="e.g. _v2"
                className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading"
              />
            </div>
          </div>

          {/* Live Name Preview */}
          {files.length > 0 && (
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs">
              <span className="font-bold text-accent-dark dark:text-accent-light block mb-1">
                Live Rename Preview:
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px] text-light-heading dark:text-dark-heading truncate">
                <span className="opacity-60">{files[0].name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent-dark dark:text-accent-light shrink-0" />
                <span className="font-bold text-accent-dark dark:text-accent-light">
                  {getRenamedPreview()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. BULK ZIP DOWNLOAD WORKSPACE */}
      {(toolId === 'bulk-zip-download' || toolId === 'bulk-rename-zip') && (
        <div className="space-y-3.5 p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-light-heading dark:text-dark-heading flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-accent-dark dark:text-accent-light" />
              ZIP Archive Output Name
            </label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. Project_Documents_Bundle"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-[11px] text-light-body dark:text-dark-body">
              All uploaded files will be zipped and compressed into this archive file.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Optional Batch Prefix
              </label>
              <input
                type="text"
                value={renamePrefix}
                onChange={(e) => setRenamePrefix(e.target.value)}
                placeholder="e.g. Doc_"
                className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Optional Batch Suffix
              </label>
              <input
                type="text"
                value={renameSuffix}
                onChange={(e) => setRenameSuffix(e.target.value)}
                placeholder="e.g. _2026"
                className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. ROTATE CONTROLS */}
      {toolId === 'rotate-pdf' && (
        <div className="space-y-2 p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <label className="text-xs font-semibold text-light-heading dark:text-dark-heading block">
            Rotation Angle
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[90, 180, 270].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => setRotateAngle(deg)}
                className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  rotateAngle === deg
                    ? 'border-accent bg-accent/10 text-light-heading dark:text-dark-heading font-bold'
                    : 'border-light-border dark:border-dark-border text-light-body dark:text-dark-body'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{deg}° Clockwise</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. PAGE NUMBERS CONTROLS */}
      {toolId === 'page-numbers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">Position</label>
            <select
              value={pagePosition}
              onChange={(e) => setPagePosition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading"
            >
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">Format</label>
            <input
              type="text"
              value={pageFormat}
              onChange={(e) => setPageFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading"
            />
          </div>
        </div>
      )}

      {/* 5. CROP CONTROLS */}
      {toolId === 'crop-pdf' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          {['top', 'right', 'bottom', 'left'].map((side) => (
            <div key={side} className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-light-heading dark:text-dark-heading">
                {side} (pt)
              </label>
              <input
                type="number"
                value={cropMargins[side]}
                onChange={(e) =>
                  setCropMargins((prev) => ({ ...prev, [side]: Number(e.target.value) || 0 }))
                }
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading"
              />
            </div>
          ))}
        </div>
      )}

      {/* 6. OCR LANGUAGE SELECTION */}
      {(toolId === 'ocr-tool' || toolId === 'image-to-text') && (
        <div className="space-y-1.5 p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <label className="text-xs font-semibold text-light-heading dark:text-dark-heading block">
            OCR Language Engine
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'eng', label: 'English' },
              { id: 'guj', label: 'Gujarati (ગુજરાતી)' },
              { id: 'hin', label: 'Hindi (हिन्दी)' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setOcrLanguage(l.id)}
                className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                  ocrLanguage === l.id
                    ? 'border-accent bg-accent/10 text-light-heading dark:text-dark-heading font-bold'
                    : 'border-light-border dark:border-dark-border text-light-body dark:text-dark-body'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
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
          {files.length > 0
            ? `${files.length} file(s) selected: ${files.map((f) => f.name).join(', ')}`
            : isMultiFile
            ? 'Drop files here to rename & package (or click to browse)'
            : 'Drop your document here, or click to browse'}
        </p>
        <p className="text-xs text-light-body dark:text-dark-body mt-1">
          {toolId === 'protect-unlock-pdf'
            ? 'Select a PDF to protect with a new password or unlock'
            : isMultiFile
            ? 'Supports batch renaming across all formats'
            : 'PDF, image, or document files'}
        </p>
      </div>

      {/* Results View for OCR Extracted Text with DOWNLOAD BUTTONS */}
      {resultData && (
        <div className="space-y-3 p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-border dark:border-dark-border pb-3">
            <div>
              <span className="text-xs font-bold text-light-heading dark:text-dark-heading block">
                Extracted OCR Text Result
              </span>
              <span className="text-[11px] text-light-body dark:text-dark-body">
                {resultData.text?.length || 0} characters extracted
              </span>
            </div>

            {/* ACTION BUTTONS: Download TXT, Download Word, Copy */}
            {resultData.text && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Download}
                  onClick={downloadOcrAsTxt}
                  className="text-xs py-1 px-2.5 h-auto"
                >
                  Download TXT
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={FileText}
                  onClick={downloadOcrAsDocx}
                  className="text-xs py-1 px-2.5 h-auto"
                >
                  Download DOC
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={copied ? Check : Copy}
                  onClick={copyResultText}
                  className="bg-accent text-black font-bold text-xs py-1 px-2.5 h-auto"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-3.5 rounded-xl bg-light-bg dark:bg-dark-bg text-xs font-mono whitespace-pre-wrap leading-relaxed text-light-heading dark:text-dark-heading">
            {resultData.text || JSON.stringify(resultData, null, 2)}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && !resultData && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {toolId === 'protect-unlock-pdf'
              ? securityMode === 'protect'
                ? 'PDF successfully encrypted with your password and downloaded!'
                : 'PDF password protection removed and unlocked document downloaded!'
              : 'Operation completed successfully! Download started.'}
          </span>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        className="w-full justify-center bg-accent text-black font-bold shadow-soft hover:shadow-glow-cyan"
        onClick={handleExecute}
        isLoading={isProcessing}
        disabled={files.length === 0}
        rightIcon={Download}
      >
        {toolId === 'protect-unlock-pdf'
          ? securityMode === 'protect'
            ? 'Encrypt PDF & Download'
            : 'Unlock PDF & Download'
          : toolId === 'file-renamer'
          ? 'Rename & Download File'
          : toolId === 'bulk-zip-download' || toolId === 'bulk-rename-zip'
          ? 'Compress & Download ZIP Archive'
          : 'Run Tool & Download Output'}
      </Button>
    </div>
  );
};

export default GenericToolWorkspace;
