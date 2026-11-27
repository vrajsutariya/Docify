import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Stamp, Upload, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { watermarkPdf, downloadBlob } from '../../services/toolsService';

export const PdfWatermarkTool = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#888888');
  const [angle, setAngle] = useState(45);
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

  const handleApply = async () => {
    if (!file) {
      setError('Please upload a PDF to apply watermark.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const blob = await watermarkPdf(file, {
        text,
        opacity,
        size: fontSize,
        color,
        angle,
      });
      downloadBlob(blob, `docify-watermarked-${Date.now()}.pdf`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to apply watermark.');
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
            Drop your PDF to watermark, or click to browse
          </p>
          <p className="text-xs text-light-body dark:text-dark-body mt-1">
            Stamp customizable text or confidentiality badges
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

          {/* Watermark Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="CONFIDENTIAL, DRAFT, INTERNAL ONLY..."
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-light-heading dark:text-dark-heading">Opacity</span>
                <span className="text-light-body dark:text-dark-body font-mono">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.9"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-light-heading dark:text-dark-heading">Font Size</span>
                <span className="text-light-body dark:text-dark-body font-mono">{fontSize} pt</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading block">
                Watermark Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-light-border dark:border-dark-border cursor-pointer bg-transparent p-0.5"
                />
                <span className="text-xs font-mono text-light-body dark:text-dark-body">{color}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-light-heading dark:text-dark-heading">Angle</span>
                <span className="text-light-body dark:text-dark-body font-mono">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="w-full accent-accent"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="relative h-28 rounded-xl bg-light-surface dark:bg-dark-surface border border-dashed border-light-border dark:border-dark-border flex items-center justify-center overflow-hidden">
            <span
              style={{
                color,
                opacity,
                fontSize: `${Math.min(32, fontSize * 0.6)}px`,
                transform: `rotate(${angle}deg)`,
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                letterSpacing: '0.1em',
              }}
              className="select-none pointer-events-none"
            >
              {text || 'PREVIEW'}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Watermarked PDF downloaded successfully!</span>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={handleApply}
            isLoading={isProcessing}
            leftIcon={Stamp}
            rightIcon={Download}
          >
            Apply Watermark & Download
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfWatermarkTool;
