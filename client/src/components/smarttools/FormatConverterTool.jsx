import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { RefreshCw, Upload, FileText, Download, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import {
  pdfToWord,
  wordToPdf,
  pdfToExcel,
  excelToPdf,
  imagesToPdf,
  convertData,
  downloadBlob,
} from '../../services/toolsService';

export const FormatConverterTool = ({ defaultConversion = 'pdf-to-word' }) => {
  const [conversionType, setConversionType] = useState(defaultConversion);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const conversionOptions = [
    { id: 'pdf-to-word', label: 'PDF to Word (.docx)', accept: '.pdf' },
    { id: 'word-to-pdf', label: 'Word to PDF', accept: '.doc,.docx' },
    { id: 'pdf-to-excel', label: 'PDF to Excel (.xlsx)', accept: '.pdf' },
    { id: 'excel-to-pdf', label: 'Excel to PDF', accept: '.xlsx,.xls,.csv' },
    { id: 'images-to-pdf', label: 'Images to PDF', accept: '.jpg,.jpeg,.png,.webp' },
    { id: 'csv-to-json', label: 'CSV to JSON', accept: '.csv' },
    { id: 'json-to-csv', label: 'JSON to CSV', accept: '.json' },
  ];

  const currentOption = conversionOptions.find((o) => o.id === conversionType) || conversionOptions[0];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: conversionType === 'images-to-pdf',
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        setFiles(accepted);
        setError(null);
        setSuccess(false);
      }
    },
  });

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please upload a file to convert.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      let blob;
      let filename = `docify-converted-${Date.now()}`;

      if (conversionType === 'pdf-to-word') {
        blob = await pdfToWord(files[0]);
        filename += '.docx';
      } else if (conversionType === 'word-to-pdf') {
        blob = await wordToPdf(files[0]);
        filename += '.pdf';
      } else if (conversionType === 'pdf-to-excel') {
        blob = await pdfToExcel(files[0]);
        filename += '.xlsx';
      } else if (conversionType === 'excel-to-pdf') {
        blob = await excelToPdf(files[0]);
        filename += '.pdf';
      } else if (conversionType === 'images-to-pdf') {
        blob = await imagesToPdf(files);
        filename += '.pdf';
      } else if (conversionType === 'csv-to-json') {
        const res = await convertData({ file: files[0], from: 'csv', to: 'json' });
        const jsonBlob = new Blob([JSON.stringify(res.data || res, null, 2)], { type: 'application/json' });
        downloadBlob(jsonBlob, `${filename}.json`);
        setSuccess(true);
        return;
      } else if (conversionType === 'json-to-csv') {
        blob = await convertData({ file: files[0], from: 'json', to: 'csv' });
        filename += '.csv';
      }

      if (blob) {
        downloadBlob(blob, filename);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Conversion failed. Please verify file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Conversion Type Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
          Select Target Conversion Pipeline
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {conversionOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setConversionType(opt.id);
                setFiles([]);
                setError(null);
                setSuccess(false);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                conversionType === opt.id
                  ? 'border-accent bg-accent/10 text-light-heading dark:text-dark-heading font-bold'
                  : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-body dark:text-dark-body hover:border-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropzone */}
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
          {files.length > 0
            ? `${files.length} file(s) selected: ${files[0].name}`
            : `Drop file here for ${currentOption.label}`}
        </p>
        <p className="text-xs text-light-body dark:text-dark-body mt-1">
          Accepted types: <span className="font-mono">{currentOption.accept}</span>
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-accent-dark dark:text-accent-light shrink-0" />
            <span className="font-semibold text-light-heading dark:text-dark-heading truncate">
              {files.map((f) => f.name).join(', ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFiles([])}
            className="text-status-danger hover:underline font-semibold shrink-0 ml-2"
          >
            Clear
          </button>
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
          <span>Conversion completed! File downloaded.</span>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        className="w-full justify-center"
        onClick={handleConvert}
        isLoading={isProcessing}
        disabled={files.length === 0}
        leftIcon={RefreshCw}
        rightIcon={Download}
      >
        Convert & Download File
      </Button>
    </div>
  );
};

export default FormatConverterTool;
