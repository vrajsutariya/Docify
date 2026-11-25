import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FileArchive, Scissors, Lock, Scan, QrCode, RefreshCw } from 'lucide-react';

export const SmartToolsPage = () => {
  const toolCategories = [
    {
      category: 'PDF Manipulation',
      icon: Scissors,
      tools: ['Merge PDFs', 'Split PDF', 'Compress PDF', 'Reorder Pages', 'Rotate Pages', 'Delete Pages'],
    },
    {
      category: 'Security & Integrity',
      icon: Lock,
      tools: ['Protect PDF (Password)', 'Unlock PDF', 'Digital Signature', 'Watermark PDF', 'Redact Sensitive PII'],
    },
    {
      category: 'Converters',
      icon: RefreshCw,
      tools: ['PDF to Word', 'Word to PDF', 'PDF to Excel', 'Excel to PDF', 'PDF to Images', 'Images to PDF'],
    },
    {
      category: 'OCR & Utilities',
      icon: Scan,
      tools: ['OCR Text Extractor', 'Invoice / Receipt Scanner', 'QR Code Generator', 'QR Code Reader', 'Checksum Validator'],
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-white">SmartTools</h1>
            <Badge variant="primary">30+ Suite</Badge>
          </div>
          <p className="text-sm text-light-text dark:text-dark-text-secondary">
            High-precision document processing, conversions, encryption, and media utilities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toolCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.category} className="space-y-4">
              <div className="flex items-center gap-2.5 text-brand-red dark:text-brand-red-bright">
                <Icon className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-light-heading dark:text-white">{cat.category}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {cat.tools.map((t) => (
                  <button
                    key={t}
                    className="p-3 rounded-xl bg-light-surface/60 dark:bg-dark-bg/60 border border-light-border dark:border-dark-border hover:border-brand-red/50 hover:text-brand-red dark:hover:text-brand-red-bright text-xs font-medium text-left transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
