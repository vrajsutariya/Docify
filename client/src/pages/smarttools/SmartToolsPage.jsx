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
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SmartToolsPage = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  const toolsList = [
    // PDF Manipulation
    {
      id: 'merge-pdfs',
      name: 'Merge PDFs',
      category: 'PDF Manipulation',
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badge: 'Popular',
      description: 'Combine multiple PDF documents into a single organized file in custom order.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'split-pdf',
      name: 'Split PDF',
      category: 'PDF Manipulation',
      icon: Scissors,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badge: 'Fast',
      description: 'Extract specific page ranges or separate individual pages into separate files.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'compress-pdf',
      name: 'Compress PDF',
      category: 'PDF Manipulation',
      icon: Minimize2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: 'High Ratio',
      description: 'Reduce file size up to 80% while preserving crisp text and image resolution.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'reorder-pages',
      name: 'Reorder Pages',
      category: 'PDF Manipulation',
      icon: RefreshCw,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Visual',
      description: 'Drag, drop, and rearrange page sequences in your document with live preview.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'rotate-pages',
      name: 'Rotate Pages',
      category: 'PDF Manipulation',
      icon: RotateCw,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      badge: '90°/180°',
      description: 'Rotate portrait and landscape pages clockwise or counter-clockwise quickly.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'delete-pages',
      name: 'Delete Pages',
      category: 'PDF Manipulation',
      icon: Trash2,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      badge: 'Clean',
      description: 'Remove unwanted, blank, or duplicate pages from any PDF document.',
      acceptedFiles: '.pdf',
    },

    // Security & Integrity
    {
      id: 'protect-pdf',
      name: 'Protect PDF (Password)',
      category: 'Security & Integrity',
      icon: Lock,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badge: 'AES-256',
      description: 'Encrypt your document with high-grade password and prevent unauthorized reading.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'unlock-pdf',
      name: 'Unlock PDF',
      category: 'Security & Integrity',
      icon: Unlock,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      badge: 'Instant',
      description: 'Remove password restrictions and printing locks from authorized PDF files.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'digital-signature',
      name: 'Digital Signature',
      category: 'Security & Integrity',
      icon: ShieldCheck,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Legal',
      description: 'Sign documents digitally with verifiable timestamped cryptographic signatures.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'watermark-pdf',
      name: 'Watermark PDF',
      category: 'Security & Integrity',
      icon: Stamp,
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      badge: 'Branding',
      description: 'Stamp custom text, confidentiality marks, or company logos across all pages.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'redact-pii',
      name: 'Redact Sensitive PII',
      category: 'Security & Integrity',
      icon: EyeOff,
      color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
      badge: 'Privacy',
      description: 'Permanently black out sensitive names, credit card numbers, and confidential text.',
      acceptedFiles: '.pdf',
    },

    // Converters
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      category: 'Converters',
      icon: FileText,
      color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
      badge: 'DOCX',
      description: 'Convert PDF files into fully editable Microsoft Word documents with matched fonts.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'word-to-pdf',
      name: 'Word to PDF',
      category: 'Converters',
      icon: FileText,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      badge: 'Universal',
      description: 'Transform DOCX and DOC files into clean, print-standard PDF documents.',
      acceptedFiles: '.doc,.docx',
    },
    {
      id: 'pdf-to-excel',
      name: 'PDF to Excel',
      category: 'Converters',
      icon: FileSpreadsheet,
      color: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20',
      badge: 'XLSX',
      description: 'Automatically extract tabular figures and borders into structured Excel spreadsheets.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'excel-to-pdf',
      name: 'Excel to PDF',
      category: 'Converters',
      icon: FileSpreadsheet,
      color: 'text-green-500 bg-green-500/10 border-green-500/20',
      badge: 'Tables',
      description: 'Export large spreadsheets and financial reports into perfectly paginated PDFs.',
      acceptedFiles: '.xls,.xlsx,.csv',
    },
    {
      id: 'pdf-to-images',
      name: 'PDF to Images',
      category: 'Converters',
      icon: Image,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      badge: '300 DPI',
      description: 'Extract every page as high-resolution PNG, JPG, or WebP graphics.',
      acceptedFiles: '.pdf',
    },
    {
      id: 'images-to-pdf',
      name: 'Images to PDF',
      category: 'Converters',
      icon: Image,
      color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20',
      badge: 'Batch',
      description: 'Combine JPG, PNG, and scanned photos into a clean multi-page PDF.',
      acceptedFiles: '.png,.jpg,.jpeg,.webp',
    },

    // OCR & Utilities
    {
      id: 'ocr-extractor',
      name: 'OCR Text Extractor',
      category: 'OCR & Utilities',
      icon: Scan,
      color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
      badge: 'EN / GU / HI',
      description: 'Recognize printed and handwritten text across English, Gujarati, and Hindi.',
      acceptedFiles: '.pdf,.png,.jpg,.jpeg',
    },
    {
      id: 'receipt-scanner',
      name: 'Invoice / Receipt Scanner',
      category: 'OCR & Utilities',
      icon: Receipt,
      color: 'text-amber-600 bg-amber-600/10 border-amber-600/20',
      badge: 'AI Parse',
      description: 'Auto-extract merchant names, tax figures, total cost, and invoice dates.',
      acceptedFiles: '.pdf,.png,.jpg,.jpeg',
    },
    {
      id: 'qr-generator',
      name: 'QR Code Generator',
      category: 'OCR & Utilities',
      icon: QrCode,
      color: 'text-accent-dark dark:text-accent-light bg-accent/10 border-accent/20',
      badge: 'Vector',
      description: 'Create custom scannable QR codes for URLs, text notes, Wi-Fi, and contact cards.',
      acceptedFiles: '*',
    },
    {
      id: 'qr-reader',
      name: 'QR Code Reader',
      category: 'OCR & Utilities',
      icon: Scan,
      color: 'text-cyan-600 bg-cyan-600/10 border-cyan-600/20',
      badge: 'Instant',
      description: 'Upload any image or screenshot to decode embedded QR code data and URLs instantly.',
      acceptedFiles: '.png,.jpg,.jpeg,.webp',
    },
    {
      id: 'checksum-validator',
      name: 'Checksum Validator',
      category: 'OCR & Utilities',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: 'SHA-256',
      description: 'Verify file integrity and authenticity using SHA-256 and MD5 cryptographic hashes.',
      acceptedFiles: '*',
    },
  ];

  const categories = ['All', 'PDF Manipulation', 'Security & Integrity', 'Converters', 'OCR & Utilities'];

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return toolsList.filter((tool) => {
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleLaunchTool = (tool) => {
    setSelectedTool(tool);
    setProcessSuccess(false);
    setIsProcessing(false);
  };

  const handleProcessTool = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessSuccess(true);
    }, 1200);
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
              'Individual precision utilities for document conversion, page manipulation, security encryption, and OCR scanning.'
            )}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body" />
          <input
            type="text"
            placeholder="Search tools (e.g. Merge, Password)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const count = cat === 'All' ? toolsList.length : toolsList.filter((t) => t.category === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-accent text-black shadow-sm font-bold'
                  : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-accent'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/15 text-black' : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1 TOOL PER BOX GRID: Each tool has its own dedicated card box */}
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
                    <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading group-hover:text-accent-dark dark:group-hover:text-accent-light transition-colors">
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
                    Launch {tool.name}
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
            Try a different search term or select another category filter.
          </p>
        </div>
      )}

      {/* Tool Runner Modal */}
      <Modal
        isOpen={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
        title={selectedTool?.name || 'Smart Tool'}
        description={selectedTool?.description || ''}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTool(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleProcessTool}
              isLoading={isProcessing}
              disabled={processSuccess}
              rightIcon={ArrowRight}
            >
              {processSuccess ? 'Complete' : 'Run Tool'}
            </Button>
          </>
        }
      >
        {selectedTool && (
          <div className="space-y-4">
            {processSuccess ? (
              <div className="p-5 rounded-2xl bg-status-success/10 border border-status-success/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
                <h4 className="font-heading font-bold text-sm text-status-success">
                  {selectedTool.name} Processed Successfully!
                </h4>
                <p className="text-xs text-light-body dark:text-dark-body">
                  Your operation is ready and verified. Result file is ready for download.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setProcessSuccess(false)}>
                    Process Another File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-light-border dark:border-dark-border hover:border-accent rounded-2xl p-6 text-center space-y-3 cursor-pointer bg-light-surface/40 dark:bg-dark-surface/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent-dark dark:text-accent-light">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                    Drop your input file here, or click to browse
                  </p>
                  <p className="text-[11px] text-light-body dark:text-dark-body">
                    Supported formats for this tool: <span className="font-mono">{selectedTool.acceptedFiles}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs text-light-body dark:text-dark-body flex items-center justify-between">
              <span className="font-medium">Category:</span>
              <Badge variant="brand" size="sm">
                {selectedTool.category}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SmartToolsPage;
