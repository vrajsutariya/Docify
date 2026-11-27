import React, { useState, useEffect } from 'react';
import { QrCode, Download, Copy, Check, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { generateQrCode, downloadQrCode, downloadBlob } from '../../services/toolsService';

export const QrCodeTool = () => {
  const [text, setText] = useState('https://docify.ai');
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const fetchQr = async (textVal, darkVal, lightVal, sizeVal) => {
    if (!textVal || textVal.trim() === '') {
      setQrDataUrl('');
      return;
    }
    try {
      setIsGenerating(true);
      setError(null);
      const res = await generateQrCode({
        text: textVal,
        darkColor: darkVal,
        lightColor: lightVal,
        size: sizeVal,
      });
      if (res?.data?.dataUrl) {
        setQrDataUrl(res.data.dataUrl);
      } else if (res?.dataUrl) {
        setQrDataUrl(res.dataUrl);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR Code.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQr(text, darkColor, lightColor, size);
    }, 300);
    return () => clearTimeout(timer);
  }, [text, darkColor, lightColor, size]);

  const handleDownload = async () => {
    if (!text) return;
    try {
      const blob = await downloadQrCode({
        text,
        darkColor,
        lightColor,
        size,
      });
      downloadBlob(blob, `docify-qrcode-${Date.now()}.png`);
    } catch (err) {
      console.error(err);
      // Fallback to data url download
      if (qrDataUrl) {
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `docify-qrcode-${Date.now()}.png`;
        a.click();
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
              Encoded Text or URL
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter website link, text message, or Wi-Fi credentials..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Docify', val: 'https://docify.ai' },
              { label: 'Wi-Fi template', val: 'WIFI:S:MyNetwork;T:WPA;P:MyPassword;;' },
              { label: 'Email', val: 'mailto:contact@docify.ai' },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setText(p.val)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-accent"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-light-heading dark:text-dark-heading block">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-light-border dark:border-dark-border cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-light-body dark:text-dark-body">{darkColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-light-heading dark:text-dark-heading block">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-light-border dark:border-dark-border cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-light-body dark:text-dark-body">{lightColor}</span>
              </div>
            </div>

            <div className="col-span-2 space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-light-heading dark:text-dark-heading">Resolution Size</span>
                <span className="font-mono text-light-body dark:text-dark-body">{size} x {size} px</span>
              </div>
              <input
                type="range"
                min="150"
                max="800"
                step="50"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
                className="w-full accent-accent"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Preview Box */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
          <div className="w-56 h-56 rounded-2xl p-3 flex items-center justify-center bg-white shadow-soft dark:shadow-soft-dark border border-light-border dark:border-dark-border">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Live QR Preview"
                className="w-full h-full object-contain select-none"
              />
            ) : (
              <div className="text-center text-xs text-light-body dark:text-dark-body">
                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <span>Enter text above to preview QR</span>
              </div>
            )}
          </div>

          <div className="w-full space-y-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={handleDownload}
              disabled={!qrDataUrl}
              leftIcon={Download}
            >
              Download High-Res PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={handleCopyLink}
              leftIcon={copied ? Check : Copy}
            >
              {copied ? 'Copied to Clipboard' : 'Copy Content Text'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeTool;
