import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FileUp, MessageSquare, BookOpen, Brain, Layers, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DocuMindPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-dark-heading">
              {t('nav.documind', 'DocuMind')}
            </h1>
            <Badge variant="brand">RAG Intelligence</Badge>
          </div>
          <p className="text-sm text-light-body dark:text-dark-body">
            {t('modules.documindDesc', 'AI document intelligence, 3-level abstraction, OCR extraction, and page-cited RAG conversation.')}
          </p>
        </div>

        <Button variant="primary" leftIcon={FileUp}>
          {t('common.upload', 'Upload Document')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 space-y-6">
          <div className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-10 text-center hover:border-accent dark:hover:border-accent-light transition-colors cursor-pointer bg-light-surface/50 dark:bg-dark-surface/50 group">
            <FileUp className="w-12 h-12 text-accent-dark dark:text-accent-light mx-auto mb-3 group-hover:scale-105 transition-transform" />
            <h3 className="font-heading font-semibold text-base text-light-heading dark:text-dark-heading">
              {t('common.upload', 'Upload Document')}
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body mt-1">
              Supports PDF, DOCX, TXT, scanned images (up to 25MB)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-3">
              <Layers className="w-5 h-5 text-accent-dark dark:text-accent-light shrink-0" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">3-Level Abstraction</p>
                <p className="text-[10px] text-light-body dark:text-dark-body">Executive, Key Points, Deep Dive</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-accent-dark dark:text-accent-light shrink-0" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">RAG Chatbot</p>
                <p className="text-[10px] text-light-body dark:text-dark-body">Cited page & paragraph sources</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center gap-3">
              <Brain className="w-5 h-5 text-accent-dark dark:text-accent-light shrink-0" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading">Knowledge Kit</p>
                <p className="text-[10px] text-light-body dark:text-dark-body">Quizzes, Flashcards, Mindmaps</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-base text-light-heading dark:text-dark-heading flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-dark dark:text-accent-light" />
            Recent Documents
          </h3>
          <div className="space-y-2.5">
            {['Contract_NDA_2026.pdf', 'Q4_Quarterly_Strategy.docx', 'Research_Paper_Transformers.pdf'].map((doc) => (
              <div
                key={doc}
                className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-between text-xs hover:border-accent dark:hover:border-accent-light cursor-pointer transition-colors"
              >
                <span className="truncate max-w-[150px] font-medium text-light-heading dark:text-dark-heading">{doc}</span>
                <span className="text-[10px] font-mono text-accent-dark dark:text-accent-light font-semibold">Indexed</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DocuMindPage;
