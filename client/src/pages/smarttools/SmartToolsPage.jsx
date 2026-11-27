import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Scissors,
  Lock,
  Unlock,
  RefreshCw,
  Scan,
  Layers,
  RotateCw,
  Trash2,
  FileText,
  FileSpreadsheet,
  Image,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Upload,
  EyeOff,
  Minimize2,
  Receipt,
  Stamp,
  CheckCircle2,
  PenTool,
  GitCompare,
  Archive,
  Hash,
  Languages,
  Tag,
  Briefcase,
  Sliders,
  Type,
  Presentation,
  FileCode,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  PdfMergeTool,
  PdfSplitTool,
  PdfWatermarkTool,
  PdfEditorTool,
  FormatConverterTool,
  ImageOptimizerTool,
  QrCodeTool,
  WordCounterTool,
  AiQuickTools,
  GenericToolWorkspace,
} from '../../components/smarttools';

export const SmartToolsPage = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All Tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);

  // Complete 26 Tools Definition across 5 Categories
  const toolsList = [
    /* -------------------------- CATEGORY 1: PDF TOOLS ------------------------- */
    {
      id: 'edit-pdf',
      name: 'Edit PDF',
      category: 'PDF Tools',
      icon: PenTool,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Interactive',
      description: 'Add custom text, highlight passages, whiteout redaction, shapes, freehand drawing, and status stamps.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'merge-pdf',
      name: 'Merge PDF',
      category: 'PDF Tools',
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badge: 'Popular',
      description: 'Drag-and-drop multiple PDFs, visual reordering, merge into a single PDF.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'split-pdf',
      name: 'Split PDF',
      category: 'PDF Tools',
      icon: Scissors,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badge: 'Fast',
      description: 'Visual page thumbnail grid to split by custom page range, every N pages, or selected pages.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'rearrange-pages',
      name: 'Extract / Delete / Rearrange Pages',
      category: 'PDF Tools',
      icon: RefreshCw,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Visual',
      description: 'Interactive grid allowing users to delete individual pages, reorder, or extract chosen pages.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'rotate-pdf',
      name: 'Rotate PDF Pages',
      category: 'PDF Tools',
      icon: RotateCw,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      badge: '90° / 180°',
      description: '90°, 180°, 270° orientation rotation per page or for all pages simultaneously.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'protect-unlock-pdf',
      name: 'Protect & Unlock PDF',
      category: 'PDF Tools',
      icon: Lock,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badge: 'AES-256',
      description: 'Encrypt with password or remove password restriction from an owned PDF.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'watermark-pdf',
      name: 'Add Watermark',
      category: 'PDF Tools',
      icon: Stamp,
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      badge: 'Branding',
      description: 'Custom diagonal or centered text ("CONFIDENTIAL", "DRAFT") or logo with opacity and size sliders.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'page-numbers',
      name: 'Page Numbers, Header & Footer',
      category: 'PDF Tools',
      icon: Type,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      badge: 'Numbered',
      description: 'Insert page numbering (e.g. "Page X of Y") at top/bottom, left/center/right.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'crop-pdf',
      name: 'Crop PDF Pages',
      category: 'PDF Tools',
      icon: Sliders,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Precision',
      description: 'Trim margins or crop pages to a specified bounding box and dimension.',
      acceptedFiles: '.pdf',
    },

    /* ------------------------ CATEGORY 2: CONVERT TOOLS ----------------------- */
    {
      id: 'pdf-word',
      name: 'PDF ↔ Word',
      category: 'Convert Tools',
      icon: FileText,
      color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
      badge: 'DOCX',
      description: 'Convert PDF to editable .docx and Word documents to print-ready PDF.',
      acceptedFiles: '.pdf,.doc,.docx',
    },
    {
      id: 'pdf-excel',
      name: 'PDF ↔ Excel',
      category: 'Convert Tools',
      icon: FileSpreadsheet,
      color: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20',
      badge: 'XLSX',
      description: 'Extract tables from PDF into .xlsx and save Excel sheets as paginated PDF.',
      acceptedFiles: '.pdf,.xlsx,.xls',
    },
    {
      id: 'pdf-powerpoint',
      name: 'PDF ↔ PowerPoint',
      category: 'Convert Tools',
      icon: Presentation,
      color: 'text-amber-600 bg-amber-600/10 border-amber-600/20',
      badge: 'Slides',
      description: 'Convert slide decks between PDF and presentation slide outlines.',
      acceptedFiles: '.pdf,.pptx',
    },
    {
      id: 'pdf-images',
      name: 'PDF ↔ JPG/PNG',
      category: 'Convert Tools',
      icon: Image,
      color: 'text-violet-600 bg-violet-600/10 border-violet-600/20',
      badge: 'Batch Render',
      description: 'Render PDF pages into high-res images or combine multiple images into a PDF.',
      acceptedFiles: '.pdf,.png,.jpg,.jpeg,.webp',
    },
    {
      id: 'html-to-pdf',
      name: 'HTML to PDF',
      category: 'Convert Tools',
      icon: FileCode,
      color: 'text-orange-600 bg-orange-600/10 border-orange-600/20',
      badge: 'Web Styles',
      description: 'Convert raw HTML or web page snippets into clean, styled, paginated PDFs.',
      acceptedFiles: '.html,.txt',
    },
    {
      id: 'csv-excel-json',
      name: 'CSV / Excel / JSON Conversion',
      category: 'Convert Tools',
      icon: RefreshCw,
      color: 'text-teal-600 bg-teal-600/10 border-teal-600/20',
      badge: 'Tabular',
      description: 'Bi-directional conversion between tabular CSV, Excel spreadsheets, and JSON objects.',
      acceptedFiles: '.csv,.xlsx,.json',
    },

    /* ---------------------- CATEGORY 3: IMAGE & OCR TOOLS --------------------- */
    {
      id: 'ocr-tool',
      name: 'OCR Tool',
      category: 'Image & OCR',
      icon: Scan,
      color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
      badge: 'Searchable',
      description: 'Extract selectable, searchable text from scanned papers and documents.',
      acceptedFiles: '.png,.jpg,.jpeg,.pdf',
    },
    {
      id: 'image-compress-resize',
      name: 'Image Compress, Resize & Convert',
      category: 'Image & OCR',
      icon: Image,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Sharp Engine',
      description: 'Batch resize dimensions, compress file size, and switch formats between JPG, PNG, and WebP.',
      acceptedFiles: '.png,.jpg,.jpeg,.webp',
    },
    {
      id: 'image-to-text',
      name: 'Image to Text (Multilingual)',
      category: 'Image & OCR',
      icon: Scan,
      color: 'text-cyan-600 bg-cyan-600/10 border-cyan-600/20',
      badge: 'EN / GU / HI',
      description: 'Multilingual OCR extracting text across English, Gujarati, and Hindi scripts.',
      acceptedFiles: '.png,.jpg,.jpeg',
    },

    /* -------------------------- CATEGORY 4: AI TOOLS -------------------------- */
    {
      id: 'ai-summarizer',
      name: 'AI Summarizer',
      category: 'AI Tools',
      icon: Sparkles,
      color: 'text-accent-dark dark:text-accent-light bg-accent/10 border-accent/20',
      badge: 'Instant AI',
      description: 'Paste raw text or upload a document for a quick summary without full DocuMind processing.',
      acceptedFiles: '.txt,.pdf,.docx',
    },
    {
      id: 'ai-translator',
      name: 'AI Translator',
      category: 'AI Tools',
      icon: Languages,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badge: 'Tri-Lingual',
      description: 'Translate entire documents or text snippets between English, Gujarati, and Hindi.',
      acceptedFiles: '.txt,.pdf',
    },
    {
      id: 'ai-grammar',
      name: 'AI Grammar & Paraphrase Checker',
      category: 'AI Tools',
      icon: CheckCircle2,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      badge: 'Tone Match',
      description: 'Correct spelling/grammar and provide tone paraphrasing (Formal, Academic, Concise).',
      acceptedFiles: '.txt',
    },
    {
      id: 'ai-title-keywords',
      name: 'AI Title & Keyword Generator',
      category: 'AI Tools',
      icon: Tag,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      badge: 'SEO Tags',
      description: 'Suggest SEO titles and core metadata keywords for papers and document content.',
      acceptedFiles: '.txt,.pdf',
    },

    /* ------------------------ CATEGORY 5: UTILITY TOOLS ----------------------- */
    {
      id: 'qr-generator-scanner',
      name: 'QR Code Generator & Scanner',
      category: 'Utilities',
      icon: QrCode,
      color: 'text-accent-dark dark:text-accent-light bg-accent/10 border-accent/20',
      badge: 'Vector/PNG',
      description: 'Generate custom QR codes (with color pickers and size controls) and scan QR images.',
      acceptedFiles: '*',
    },
    {
      id: 'file-renamer',
      name: 'File Renamer',
      category: 'Utilities',
      icon: FileText,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Custom Name',
      description: 'Upload any file, choose a custom new name, optional prefix/suffix, live preview, and download instantly.',
      acceptedFiles: '*',
    },
    {
      id: 'bulk-zip-download',
      name: 'Bulk ZIP Download',
      category: 'Utilities',
      icon: Archive,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      badge: 'Batch ZIP',
      description: 'Compress and bundle multiple documents, images, or PDFs into a single downloadable ZIP archive.',
      acceptedFiles: '*',
    },
    {
      id: 'word-counter',
      name: 'Word, Character & Reading-Time Counter',
      category: 'Utilities',
      icon: Hash,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Live Metrics',
      description: 'Real-time text analytics dashboard showing word count, characters, sentences, and reading time.',
      acceptedFiles: '*',
    },
  ];

  const categories = ['All Tools', 'PDF Tools', 'Convert Tools', 'Image & OCR', 'AI Tools', 'Utilities'];

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return toolsList.filter((tool) => {
      const matchesCategory =
        activeCategory === 'All Tools' ||
        tool.category.toLowerCase().includes(activeCategory.toLowerCase().replace(' tools', ''));
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleLaunchTool = (tool) => {
    setSelectedTool(tool);
  };

  // Render the dedicated interactive sub-tool view inside the Modal
  const renderToolWorkspace = () => {
    if (!selectedTool) return null;

    switch (selectedTool.id) {
      case 'edit-pdf':
        return <PdfEditorTool />;
      case 'merge-pdf':
        return <PdfMergeTool />;
      case 'split-pdf':
      case 'rearrange-pages':
        return <PdfSplitTool />;
      case 'watermark-pdf':
        return <PdfWatermarkTool />;
      case 'pdf-word':
        return <FormatConverterTool defaultConversion="pdf-to-word" />;
      case 'pdf-excel':
        return <FormatConverterTool defaultConversion="pdf-to-excel" />;
      case 'pdf-powerpoint':
      case 'html-to-pdf':
        return <FormatConverterTool defaultConversion="pdf-to-word" />;
      case 'pdf-images':
        return <FormatConverterTool defaultConversion="images-to-pdf" />;
      case 'csv-excel-json':
        return <FormatConverterTool defaultConversion="csv-to-json" />;
      case 'image-compress-resize':
        return <ImageOptimizerTool />;
      case 'qr-generator-scanner':
        return <QrCodeTool />;
      case 'word-counter':
        return <WordCounterTool />;
      case 'ai-summarizer':
        return <AiQuickTools initialTool="summary" />;
      case 'ai-translator':
        return <AiQuickTools initialTool="translate" />;
      case 'ai-grammar':
        return <AiQuickTools initialTool="grammar" />;
      case 'ai-title-keywords':
        return <AiQuickTools initialTool="keywords" />;
      default:
        // Generic interactive handler for rotate, protect, unlock, page-numbers, crop, bulk-rename, ocr
        return <GenericToolWorkspace toolId={selectedTool.id} />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('nav.smarttools', 'SmartTools Suite')}
            </h1>
            <Badge variant="brand" size="sm" icon={Sparkles}>
              {toolsList.length} Utilities
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-light-body dark:text-dark-body max-w-2xl">
            {t(
              'modules.smarttoolsDesc',
              'High-speed precision utilities for binary PDF manipulation, bi-directional conversions, multilingual OCR scanning, and instant AI file workflows.'
            )}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body" />
          <input
            type="text"
            placeholder="Search all 31 tools (e.g. Merge, Sign)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const count =
            cat === 'All Tools'
              ? toolsList.length
              : toolsList.filter((t) =>
                  t.category.toLowerCase().includes(cat.toLowerCase().replace(' tools', ''))
                ).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-accent text-black shadow-sm font-bold'
                  : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-accent'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-black/15 text-black font-bold'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body font-mono'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 31 TOOLS INTERACTIVE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredTools.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Card
                className="group h-full flex flex-col justify-between p-5 border border-light-border dark:border-dark-border hover:border-accent hover:shadow-soft dark:hover:shadow-soft-dark transition-all cursor-pointer bg-light-surface dark:bg-dark-surface rounded-2xl"
                onClick={() => handleLaunchTool(tool)}
              >
                <div className="space-y-3.5">
                  {/* Top: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-2.5 rounded-xl border ${tool.color}`}>
                      <ToolIcon className="w-5 h-5" />
                    </div>
                    <Badge variant="neutral" size="sm" className="text-[10px] uppercase font-mono tracking-wider">
                      {tool.badge}
                    </Badge>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading group-hover:text-accent-dark dark:group-hover:text-accent-light transition-colors line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-accent-dark/80 dark:text-accent-light/80 mt-0.5">
                      {tool.category}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-light-body dark:text-dark-body line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Bottom Launch Action */}
                <div className="pt-4 mt-3 border-t border-light-border/60 dark:border-dark-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    rightIcon={ArrowRight}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchTool(tool);
                    }}
                  >
                    Open Tool
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-light-border dark:border-dark-border space-y-2">
          <Search className="w-10 h-10 text-light-body dark:text-dark-body mx-auto opacity-40" />
          <h3 className="font-heading text-base font-semibold text-light-heading dark:text-dark-heading">
            No smart tools match "{searchQuery}"
          </h3>
          <p className="text-xs text-light-body dark:text-dark-body">
            Try a different search query or click "All Tools" to view the full suite.
          </p>
        </div>
      )}

      {/* DEDICATED TOOL MODAL WORKSPACE */}
      <Modal
        isOpen={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
        title={selectedTool?.name || 'Smart Tool Workspace'}
        description={selectedTool?.description || ''}
        className={selectedTool?.id === 'edit-pdf' ? 'max-w-4xl sm:max-w-5xl' : 'max-w-2xl sm:max-w-3xl'}
        footer={
          <div className="flex items-center justify-between w-full">
            <Badge variant="brand" size="sm">
              {selectedTool?.category}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTool(null)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="py-2">
          {renderToolWorkspace()}
        </div>
      </Modal>
    </div>
  );
};

export default SmartToolsPage;
