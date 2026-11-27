import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { processImage, compressImage, downloadBlob } from '../../services/toolsService';

export const ImageOptimizerTool = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState('jpeg');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
    onDrop: (accepted) => {
      if (accepted[0]) {
        setFile(accepted[0]);
        setPreviewUrl(URL.createObjectURL(accepted[0]));
        setError(null);
        setSuccess(false);
      }
    },
  });

  const handleProcess = async () => {
    if (!file) {
      setError('Please select an image.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const blob = await processImage(file, {
        quality,
        format,
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
      });

      downloadBlob(blob, `docify-optimized.${format}`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to optimize image.');
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
            Drop an image to compress or resize
          </p>
          <p className="text-xs text-light-body dark:text-dark-body mt-1">
            PNG, JPG, or WebP up to 50 MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-16 h-16 rounded-xl object-cover border border-light-border dark:border-dark-border shrink-0"
              />
            )}
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-light-heading dark:text-dark-heading truncate">
                {file.name}
              </p>
              <p className="text-[11px] text-light-body dark:text-dark-body">
                Original size: {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
              className="text-xs text-status-danger hover:underline font-semibold"
            >
              Change
            </button>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
            {/* Output Format */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Target Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['jpeg', 'png', 'webp'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`py-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                      format === fmt
                        ? 'border-accent bg-accent/10 text-light-heading dark:text-dark-heading font-bold'
                        : 'border-light-border dark:border-dark-border text-light-body dark:text-dark-body'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-light-heading dark:text-dark-heading">
                  Compression Quality
                </span>
                <span className="text-accent-dark dark:text-accent-light font-mono font-bold">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-accent"
              />
            </div>

            {/* Custom Dimensions */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Max Width (px)
              </label>
              <input
                type="number"
                placeholder="Auto"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Max Height (px)
              </label>
              <input
                type="number"
                placeholder="Auto"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
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
              <span>Optimized image downloaded successfully!</span>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={handleProcess}
            isLoading={isProcessing}
            leftIcon={Image}
            rightIcon={Download}
          >
            Process & Download Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageOptimizerTool;
