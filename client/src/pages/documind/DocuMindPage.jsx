import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FileUp, MessageSquare, BookOpen, Brain, Layers } from 'lucide-react';

export const DocuMindPage = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-light-heading dark:text-white">DocuMind</h1>
            <Badge variant="primary">Module 1</Badge>
          </div>
          <p className="text-sm text-light-text dark:text-dark-text-secondary">
            AI document intelligence, 3-level abstraction, OCR extraction, and page-cited RAG conversation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 space-y-6">
          <div className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-10 text-center hover:border-brand-red transition-colors cursor-pointer bg-light-surface/50 dark:bg-dark-bg/50">
            <FileUp className="w-12 h-12 text-brand-red mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-base text-light-heading dark:text-white">Upload Document</h3>
            <p className="text-xs text-light-text dark:text-dark-text-secondary mt-1">
              Supports PDF, DOCX, TXT, scanned images (up to 25MB)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center gap-3">
              <Layers className="w-5 h-5 text-brand-red" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-white">3-Level Abstraction</p>
                <p className="text-[10px] text-light-text dark:text-dark-text-secondary">Executive, Key Points, Deep Dive</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-brand-orange" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-white">RAG Chatbot</p>
                <p className="text-[10px] text-light-text dark:text-dark-text-secondary">Cited page & paragraph sources</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center gap-3">
              <Brain className="w-5 h-5 text-brand-red-bright" />
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-white">Knowledge Kit</p>
                <p className="text-[10px] text-light-text dark:text-dark-text-secondary">Quizzes, Flashcards, Mindmaps</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-base text-light-heading dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-orange" />
            Recent Documents
          </h3>
          <p className="text-xs text-light-text dark:text-dark-text-secondary">
            No documents analyzed yet. Upload your first document to initiate extraction and RAG indexing.
          </p>
        </Card>
      </div>
    </div>
  );
};
