import React, { useRef, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PenTool, Upload, RotateCcw, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { signPdf, downloadBlob } from '../../services/toolsService';

export const PdfSignTool = () => {
  const [file, setFile] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const canvasRef = useRef(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!file) {
      setError('Please upload a PDF to sign.');
      return;
    }
    if (!hasSignature) {
      setError('Please draw your signature on the pad above.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL('image/png');

      const blob = await signPdf(file, {
        signatureData,
        pageNumber,
      });

      downloadBlob(blob, `docify-signed-${Date.now()}.pdf`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to apply signature to PDF.');
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
            Drop your PDF to sign, or click to browse
          </p>
          <p className="text-xs text-light-body dark:text-dark-body mt-1">
            Sign digitally with interactive signature canvas
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

          {/* Interactive Signature Pad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Draw Your Signature
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPenColor('#000000')}
                  className={`w-4 h-4 rounded-full bg-black border ${penColor === '#000000' ? 'ring-2 ring-accent' : ''}`}
                  title="Black ink"
                />
                <button
                  type="button"
                  onClick={() => setPenColor('#0d47a1')}
                  className={`w-4 h-4 rounded-full bg-blue-800 border ${penColor === '#0d47a1' ? 'ring-2 ring-accent' : ''}`}
                  title="Blue ink"
                />
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-status-danger hover:underline flex items-center gap-1 ml-2 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>

            <div className="border border-light-border dark:border-dark-border rounded-2xl bg-white dark:bg-zinc-950 p-2 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 cursor-crosshair touch-none"
              />
            </div>
            <p className="text-[11px] text-light-body dark:text-dark-body text-center">
              Draw inside the box using your mouse, trackpad, or finger.
            </p>
          </div>

          {/* Options */}
          <div className="p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-between">
            <span className="text-xs font-semibold text-light-heading dark:text-dark-heading">
              Page to Sign:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-light-body dark:text-dark-body">Page</span>
              <input
                type="number"
                min="1"
                value={pageNumber}
                onChange={(e) => setPageNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 px-2 py-1 rounded-lg text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-center font-bold"
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
              <span>Signed PDF downloaded successfully!</span>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={handleSign}
            isLoading={isProcessing}
            disabled={!hasSignature}
            leftIcon={PenTool}
            rightIcon={Download}
          >
            Apply Signature & Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfSignTool;
