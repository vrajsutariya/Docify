import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import {
  Type,
  Highlighter,
  Square,
  PenTool,
  Stamp,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  MousePointer,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { editPdf, downloadBlob } from '../../services/toolsService';

const STAMP_PRESETS = [
  { label: 'APPROVED', color: '#10B981' },
  { label: 'CONFIDENTIAL', color: '#EF4444' },
  { label: 'DRAFT', color: '#F59E0B' },
  { label: 'PAID', color: '#06B6D4' },
  { label: 'REJECTED', color: '#DC2626' },
  { label: 'VERIFIED', color: '#6366F1' },
  { label: 'URGENT', color: '#EC4899' },
];

const COLOR_PALETTE = [
  '#06B6D4', // Docify Cyan
  '#000000', // Black
  '#EF4444', // Red
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#FFFFFF', // White
];

const HIGHLIGHT_COLORS = [
  '#FDE047', // Fluorescent Yellow
  '#06B6D4', // Fluorescent Cyan
  '#4ADE80', // Mint Green
  '#F472B6', // Rose Pink
  '#FB923C', // Warm Orange
];

export const PdfEditorTool = () => {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDimensions, setPageDimensions] = useState({ width: 595, height: 842 });
  const [singlePageUrl, setSinglePageUrl] = useState(null);
  const [zoom, setZoom] = useState(100);

  // Active Tool Mode: 'select' | 'text' | 'highlight' | 'whiteout' | 'rectangle' | 'drawing' | 'stamp'
  const [activeTool, setActiveTool] = useState('text');

  // Tool settings
  const [textColor, setTextColor] = useState('#06B6D4');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [textContent, setTextContent] = useState('Sample Text');

  const [highlightColor, setHighlightColor] = useState('#FDE047');
  const [rectStrokeColor, setRectStrokeColor] = useState('#06B6D4');
  const [rectFillColor, setRectFillColor] = useState('transparent');
  const [rectBorderWidth, setRectBorderWidth] = useState(2);

  const [drawColor, setDrawColor] = useState('#EF4444');
  const [drawWidth, setDrawWidth] = useState(3);

  const [selectedStamp, setSelectedStamp] = useState(STAMP_PRESETS[0]);

  // Edits list across all pages: Array of objects
  const [edits, setEdits] = useState([]);
  const [history, setHistory] = useState([]);

  // Drawing / Drag interaction state
  const [isInteracting, setIsInteracting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);

  // Processing & Feedback state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);

  // File Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: async (accepted) => {
      if (accepted[0]) {
        const selectedFile = accepted[0];
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
        setEdits([]);
        setHistory([]);
        setCurrentPage(1);

        try {
          const arrayBuf = await selectedFile.arrayBuffer();
          const loadedDoc = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
          pdfDocRef.current = loadedDoc;
          const count = loadedDoc.getPageCount();
          setTotalPages(count);

          if (count > 0) {
            const firstPage = loadedDoc.getPages()[0];
            const { width, height } = firstPage.getSize();
            setPageDimensions({ width, height });
            await generateSinglePagePreview(loadedDoc, 1);
          }
        } catch (err) {
          console.error('Error loading PDF:', err);
          setError('Failed to parse PDF document. Please verify the file.');
        }
      }
    },
  });

  // Extract a single-page PDF to render cleanly in browser preview
  const generateSinglePagePreview = async (loadedDoc, pageNum) => {
    try {
      if (!loadedDoc) return;
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(loadedDoc, [pageNum - 1]);
      singleDoc.addPage(copiedPage);

      const singleBytes = await singleDoc.save();
      const singleBlob = new Blob([singleBytes], { type: 'application/pdf' });
      if (singlePageUrl) {
        URL.revokeObjectURL(singlePageUrl);
      }
      const newUrl = URL.createObjectURL(singleBlob);
      setSinglePageUrl(newUrl);

      const page = loadedDoc.getPages()[pageNum - 1];
      const { width, height } = page.getSize();
      setPageDimensions({ width, height });
    } catch (err) {
      console.warn('Single-page preview generation warning:', err);
    }
  };

  // Change page
  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (pdfDocRef.current) {
      await generateSinglePagePreview(pdfDocRef.current, newPage);
    }
  };

  // Get canvas click coordinates relative to rendered page container
  const getCoordinates = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return { x, y };
  };

  // Canvas Mouse Down
  const handleMouseDown = (e) => {
    if (!file) return;
    const pos = getCoordinates(e);
    setIsInteracting(true);
    setStartPos(pos);
    setCurrentPos(pos);

    if (activeTool === 'drawing') {
      setCurrentPath([pos]);
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e) => {
    if (!isInteracting) return;
    const pos = getCoordinates(e);
    setCurrentPos(pos);

    if (activeTool === 'drawing') {
      setCurrentPath((prev) => [...prev, pos]);
    }
  };

  // Canvas Mouse Up / Completion of edit
  const handleMouseUp = () => {
    if (!isInteracting || !containerRef.current) {
      setIsInteracting(false);
      return;
    }
    setIsInteracting(false);

    const rect = containerRef.current.getBoundingClientRect();
    const viewWidth = rect.width;
    const viewHeight = rect.height;

    let newEdit = null;

    if (activeTool === 'text') {
      const textToPlace = textContent.trim() || 'Sample Text';
      newEdit = {
        id: `edit-${Date.now()}`,
        page: currentPage,
        type: 'text',
        text: textToPlace,
        x: currentPos.x,
        y: currentPos.y,
        size: fontSize,
        font: fontFamily,
        bold: isBold,
        color: textColor,
        viewWidth,
        viewHeight,
      };
    } else if (activeTool === 'highlight') {
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);
      if (width > 5 || height > 5) {
        newEdit = {
          id: `edit-${Date.now()}`,
          page: currentPage,
          type: 'highlight',
          x: Math.min(startPos.x, currentPos.x),
          y: Math.min(startPos.y, currentPos.y),
          width: Math.max(width, 20),
          height: Math.max(height, 16),
          color: highlightColor,
          opacity: 0.35,
          viewWidth,
          viewHeight,
        };
      }
    } else if (activeTool === 'whiteout') {
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);
      if (width > 5 || height > 5) {
        newEdit = {
          id: `edit-${Date.now()}`,
          page: currentPage,
          type: 'whiteout',
          x: Math.min(startPos.x, currentPos.x),
          y: Math.min(startPos.y, currentPos.y),
          width: Math.max(width, 20),
          height: Math.max(height, 16),
          viewWidth,
          viewHeight,
        };
      }
    } else if (activeTool === 'rectangle') {
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);
      if (width > 5 || height > 5) {
        newEdit = {
          id: `edit-${Date.now()}`,
          page: currentPage,
          type: 'rectangle',
          x: Math.min(startPos.x, currentPos.x),
          y: Math.min(startPos.y, currentPos.y),
          width: Math.max(width, 20),
          height: Math.max(height, 20),
          strokeColor: rectStrokeColor,
          fillColor: rectFillColor === 'transparent' ? undefined : rectFillColor,
          borderWidth: rectBorderWidth,
          viewWidth,
          viewHeight,
        };
      }
    } else if (activeTool === 'drawing') {
      if (currentPath.length >= 2) {
        newEdit = {
          id: `edit-${Date.now()}`,
          page: currentPage,
          type: 'drawing',
          points: currentPath,
          color: drawColor,
          strokeWidth: drawWidth,
          viewWidth,
          viewHeight,
        };
      }
      setCurrentPath([]);
    } else if (activeTool === 'stamp') {
      newEdit = {
        id: `edit-${Date.now()}`,
        page: currentPage,
        type: 'stamp',
        stampText: selectedStamp.label,
        color: selectedStamp.color,
        x: currentPos.x - 70,
        y: currentPos.y - 22,
        width: 140,
        height: 44,
        viewWidth,
        viewHeight,
      };
    }

    if (newEdit) {
      setEdits((prev) => {
        setHistory((h) => [...h, prev]);
        return [...prev, newEdit];
      });
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setEdits(previous);
      setHistory((h) => h.slice(0, h.length - 1));
    } else if (edits.length > 0) {
      setEdits((prev) => prev.slice(0, prev.length - 1));
    }
  };

  // Clear edits on current page
  const handleClearCurrentPage = () => {
    setEdits((prev) => {
      setHistory((h) => [...h, prev]);
      return prev.filter((e) => e.page !== currentPage);
    });
  };

  // Delete individual edit
  const handleDeleteEdit = (id) => {
    setEdits((prev) => {
      setHistory((h) => [...h, prev]);
      return prev.filter((e) => e.id !== id);
    });
  };

  // Save and download modified PDF
  const handleSaveAndDownload = async () => {
    if (!file) {
      setError('Please upload a PDF to edit.');
      return;
    }
    if (edits.length === 0) {
      setError('Please add at least one edit (text, highlight, stamp, or drawing) before saving.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const blob = await editPdf(file, edits);
      const downloadName = file.name.replace(/\.[^/.]+$/, '') + '-edited.pdf';
      downloadBlob(blob, downloadName);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to edit PDF:', err);
      setError(err?.message || 'Failed to apply edits to PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Current page edits
  const currentPageEdits = edits.filter((e) => e.page === currentPage);

  // Aspect ratio styling
  const aspectRatio = pageDimensions.width / Math.max(1, pageDimensions.height);
  const containerWidthPx = Math.min(680, 560 * (zoom / 100));
  const containerHeightPx = containerWidthPx / Math.max(0.2, aspectRatio);

  return (
    <div className="space-y-6">
      {/* 1. UPLOAD VIEW IF NO FILE */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-accent bg-accent/5'
              : 'border-light-border dark:border-dark-border hover:border-accent hover:bg-light-surface/60 dark:hover:bg-dark-surface/60'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent-dark dark:text-accent-light flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading mb-1">
            Choose a PDF to Edit & Annotate
          </h3>
          <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto mb-4">
            Add custom text, highlight passages, whiteout sensitive data, draw shapes, freehand sketch, or apply official status stamps.
          </p>
          <Button variant="primary" size="sm" leftIcon={Upload} className="bg-accent text-black font-bold">
            Select PDF File
          </Button>
        </div>
      ) : (
        /* 2. FULL INTERACTIVE PDF EDITOR WORKSPACE */
        <div className="space-y-4">
          {/* Top Control Bar: File info, page navigation, zoom, and Save action */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-soft">
            {/* Left: File Badge & Re-upload */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent-dark dark:text-accent-light">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-light-heading dark:text-dark-heading line-clamp-1 max-w-[200px] sm:max-w-[260px]">
                  {file.name}
                </p>
                <p className="text-[10px] text-light-body dark:text-dark-body">
                  {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} • {edits.length} total edits
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-[11px] font-semibold text-accent-dark dark:text-accent-light hover:underline ml-1"
              >
                Change
              </button>
            </div>

            {/* Center: Page Controls */}
            <div className="flex items-center gap-1.5 bg-light-bg dark:bg-dark-bg px-2.5 py-1 rounded-xl border border-light-border dark:border-dark-border">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-light-heading dark:text-dark-heading px-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Zoom & Save Action */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-light-bg dark:bg-dark-bg px-2 py-1 rounded-xl border border-light-border dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(60, z - 15))}
                  className="p-1 rounded-lg text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-semibold text-light-heading dark:text-dark-heading w-10 text-center">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(160, z + 15))}
                  className="p-1 rounded-lg text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={Download}
                onClick={handleSaveAndDownload}
                isLoading={isProcessing}
                className="bg-accent text-black font-bold shadow-soft hover:shadow-glow-cyan"
              >
                Save & Download PDF
              </Button>
            </div>
          </div>

          {/* Tool Selector Bar */}
          <div className="p-3 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-3">
            {/* Primary Tool Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-light-border dark:border-dark-border">
              <button
                type="button"
                onClick={() => setActiveTool('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'text'
                    ? 'bg-accent text-black shadow-sm font-bold'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-accent border border-transparent'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('highlight')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'highlight'
                    ? 'bg-accent text-black shadow-sm font-bold'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-accent border border-transparent'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>Highlight</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('whiteout')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'whiteout'
                    ? 'bg-accent text-black shadow-sm font-bold'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-accent border border-transparent'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Whiteout</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('rectangle')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'rectangle'
                    ? 'bg-accent text-black shadow-sm font-bold'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-accent border border-transparent'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Rectangle</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('drawing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'drawing'
                    ? 'bg-accent text-black shadow-sm font-bold'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-accent border border-transparent'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Freehand Pen</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('stamp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'stamp'
                    ? 'bg-accent text-black shadow-sm font-bold'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-accent border border-transparent'
                }`}
              >
                <Stamp className="w-3.5 h-3.5" />
                <span>Stamps</span>
              </button>

              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Undo2}
                  onClick={handleUndo}
                  disabled={edits.length === 0}
                  className="text-xs"
                >
                  Undo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Trash2}
                  onClick={handleClearCurrentPage}
                  disabled={currentPageEdits.length === 0}
                  className="text-xs text-rose-500 hover:text-rose-600"
                >
                  Clear Page
                </Button>
              </div>
            </div>

            {/* Sub-toolbar Settings based on Active Tool */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* TEXT CONTROLS */}
              {activeTool === 'text' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-light-body dark:text-dark-body">Text:</span>
                    <input
                      type="text"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Type text to place..."
                      className="px-2.5 py-1 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs w-44 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-light-body dark:text-dark-body">Size:</span>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs focus:outline-none focus:border-accent"
                    >
                      <option value={12}>12 px</option>
                      <option value={14}>14 px</option>
                      <option value={16}>16 px</option>
                      <option value={20}>20 px</option>
                      <option value={24}>24 px</option>
                      <option value={32}>32 px</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-light-body dark:text-dark-body">Font:</span>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs focus:outline-none focus:border-accent"
                    >
                      <option value="Helvetica">Helvetica (Clean)</option>
                      <option value="Times">Times Roman (Serif)</option>
                      <option value="Courier">Courier (Mono)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBold(!isBold)}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all ${
                      isBold
                        ? 'bg-accent text-black border-accent'
                        : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body border-light-border dark:border-dark-border'
                    }`}
                  >
                    B
                  </button>

                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="font-semibold text-light-body dark:text-dark-body">Color:</span>
                    {COLOR_PALETTE.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTextColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          textColor === c ? 'scale-125 border-accent' : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* HIGHLIGHT CONTROLS */}
              {activeTool === 'highlight' && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-light-body dark:text-dark-body">
                    Drag on document to highlight:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setHighlightColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          highlightColor === c ? 'scale-125 border-black dark:border-white shadow-sm' : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* WHITEOUT CONTROLS */}
              {activeTool === 'whiteout' && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-light-body dark:text-dark-body">
                    Drag over any sensitive text or area to redact with clean white background.
                  </span>
                </div>
              )}

              {/* RECTANGLE CONTROLS */}
              {activeTool === 'rectangle' && (
                <>
                  <span className="font-semibold text-light-body dark:text-dark-body">Border Color:</span>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PALETTE.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setRectStrokeColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          rectStrokeColor === c ? 'scale-125 border-accent' : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <span className="font-semibold text-light-body dark:text-dark-body ml-2">Border:</span>
                  <select
                    value={rectBorderWidth}
                    onChange={(e) => setRectBorderWidth(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs"
                  >
                    <option value={1}>1px Thin</option>
                    <option value={2}>2px Normal</option>
                    <option value={4}>4px Thick</option>
                  </select>
                </>
              )}

              {/* DRAWING CONTROLS */}
              {activeTool === 'drawing' && (
                <>
                  <span className="font-semibold text-light-body dark:text-dark-body">Pen Color:</span>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PALETTE.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDrawColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          drawColor === c ? 'scale-125 border-accent' : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <span className="font-semibold text-light-body dark:text-dark-body ml-2">Pen Width:</span>
                  <select
                    value={drawWidth}
                    onChange={(e) => setDrawWidth(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs"
                  >
                    <option value={1}>1px Fine</option>
                    <option value={2}>2px Normal</option>
                    <option value={4}>4px Bold</option>
                    <option value={6}>6px Marker</option>
                  </select>
                </>
              )}

              {/* STAMPS CONTROLS */}
              {activeTool === 'stamp' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-light-body dark:text-dark-body">Select Stamp & Click Page:</span>
                  {STAMP_PRESETS.map((stamp) => (
                    <button
                      key={stamp.label}
                      type="button"
                      onClick={() => setSelectedStamp(stamp)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase border transition-all ${
                        selectedStamp.label === stamp.label
                          ? 'border-accent shadow-sm scale-105'
                          : 'border-light-border dark:border-dark-border opacity-70 hover:opacity-100'
                      }`}
                      style={{ color: stamp.color, borderColor: selectedStamp.label === stamp.label ? stamp.color : undefined }}
                    >
                      {stamp.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. INTERACTIVE PDF STAGE & CANVAS */}
          <div className="flex justify-center p-4 bg-zinc-900/90 rounded-2xl overflow-auto border border-light-border dark:border-dark-border shadow-inner">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="relative select-none shadow-2xl bg-white cursor-crosshair transition-all"
              style={{
                width: `${containerWidthPx}px`,
                height: `${containerHeightPx}px`,
              }}
            >
              {/* Background PDF Viewer (Single-Page Clean Frame) */}
              {singlePageUrl && (
                <object
                  data={`${singlePageUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  type="application/pdf"
                  className="w-full h-full pointer-events-none absolute inset-0 z-0 bg-white"
                  title={`Page ${currentPage} preview`}
                />
              )}

              {/* Active Annotations SVG Layer */}
              <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none">
                {currentPageEdits.map((edit) => {
                  if (edit.type === 'text') {
                    return (
                      <text
                        key={edit.id}
                        x={edit.x}
                        y={edit.y}
                        fill={edit.color || '#06B6D4'}
                        fontSize={edit.size || 16}
                        fontWeight={edit.bold ? 'bold' : 'normal'}
                        fontFamily={edit.font || 'Helvetica'}
                      >
                        {edit.text}
                      </text>
                    );
                  }
                  if (edit.type === 'highlight') {
                    return (
                      <rect
                        key={edit.id}
                        x={edit.x}
                        y={edit.y}
                        width={edit.width}
                        height={edit.height}
                        fill={edit.color || '#FDE047'}
                        opacity={edit.opacity || 0.35}
                      />
                    );
                  }
                  if (edit.type === 'whiteout') {
                    return (
                      <rect
                        key={edit.id}
                        x={edit.x}
                        y={edit.y}
                        width={edit.width}
                        height={edit.height}
                        fill="#FFFFFF"
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                    );
                  }
                  if (edit.type === 'rectangle') {
                    return (
                      <rect
                        key={edit.id}
                        x={edit.x}
                        y={edit.y}
                        width={edit.width}
                        height={edit.height}
                        fill={edit.fillColor || 'transparent'}
                        stroke={edit.strokeColor || '#06B6D4'}
                        strokeWidth={edit.borderWidth || 2}
                      />
                    );
                  }
                  if (edit.type === 'drawing' && edit.points) {
                    const pointsStr = edit.points.map((pt) => `${pt.x},${pt.y}`).join(' ');
                    return (
                      <polyline
                        key={edit.id}
                        points={pointsStr}
                        fill="none"
                        stroke={edit.color || '#EF4444'}
                        strokeWidth={edit.strokeWidth || 3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  }
                  if (edit.type === 'stamp') {
                    return (
                      <g key={edit.id}>
                        <rect
                          x={edit.x}
                          y={edit.y}
                          width={edit.width || 140}
                          height={edit.height || 44}
                          rx={6}
                          fill={edit.color}
                          fillOpacity={0.12}
                          stroke={edit.color}
                          strokeWidth={2}
                          strokeDasharray="4 2"
                        />
                        <text
                          x={edit.x + (edit.width || 140) / 2}
                          y={edit.y + (edit.height || 44) / 2 + 5}
                          textAnchor="middle"
                          fill={edit.color}
                          fontSize={15}
                          fontWeight="bold"
                          fontFamily="Helvetica"
                          letterSpacing="2px"
                        >
                          {edit.stampText}
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}

                {/* In-progress Drag/Draw Preview */}
                {isInteracting && (
                  <>
                    {(activeTool === 'highlight' || activeTool === 'whiteout' || activeTool === 'rectangle') && (
                      <rect
                        x={Math.min(startPos.x, currentPos.x)}
                        y={Math.min(startPos.y, currentPos.y)}
                        width={Math.abs(currentPos.x - startPos.x)}
                        height={Math.abs(currentPos.y - startPos.y)}
                        fill={
                          activeTool === 'whiteout'
                            ? '#FFFFFF'
                            : activeTool === 'highlight'
                            ? highlightColor
                            : rectFillColor === 'transparent'
                            ? 'none'
                            : rectFillColor
                        }
                        opacity={activeTool === 'highlight' ? 0.35 : 0.8}
                        stroke={activeTool === 'rectangle' ? rectStrokeColor : '#06B6D4'}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                    )}

                    {activeTool === 'drawing' && currentPath.length > 1 && (
                      <polyline
                        points={currentPath.map((pt) => `${pt.x},${pt.y}`).join(' ')}
                        fill="none"
                        stroke={drawColor}
                        strokeWidth={drawWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* 4. CURRENT PAGE ANNOTATION LIST */}
          {currentPageEdits.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-light-heading dark:text-dark-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-dark dark:text-accent-light" />
                  Annotations on Page {currentPage} ({currentPageEdits.length})
                </span>
                <span className="text-[11px] text-light-body dark:text-dark-body">
                  Click trash icon to remove any layer
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentPageEdits.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs"
                  >
                    <span className="font-semibold capitalize text-light-heading dark:text-dark-heading">
                      {item.type} {item.text ? `"${item.text.slice(0, 12)}..."` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEdit(item.id)}
                      className="text-light-body hover:text-rose-500 transition-colors"
                      title="Delete this edit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>PDF edits successfully applied and saved! Your downloaded document is ready.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfEditorTool;
