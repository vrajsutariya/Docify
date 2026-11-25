import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Scissors, Lock, Scan, RefreshCw, Wrench } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SmartToolsPage = () => {
  const { t } = useLanguage();

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-dark-heading">
              {t('nav.smarttools', 'SmartTools')}
            </h1>
            <Badge variant="brand">30+ Suite</Badge>
          </div>
          <p className="text-sm text-light-body dark:text-dark-body">
            {t('modules.smarttoolsDesc', 'Comprehensive PDF manipulation, conversion, OCR scanning, watermarking, encryption, and productivity utilities.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toolCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.category} className="space-y-4">
              <div className="flex items-center gap-2.5 text-accent-dark dark:text-accent-light">
                <Icon className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                  {cat.category}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {cat.tools.map((toolName) => (
                  <button
                    key={toolName}
                    type="button"
                    className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-accent dark:hover:border-accent-light hover:text-accent-dark dark:hover:text-accent-light text-xs font-medium text-left transition-all"
                  >
                    {toolName}
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

export default SmartToolsPage;
