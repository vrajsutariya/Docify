import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart3, Wrench, Sparkles, ArrowRight, ShieldCheck, Zap, Languages } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const HomePage = () => {
  const modules = [
    {
      title: 'DocuMind',
      tagline: 'Document Intelligence & RAG Chat',
      desc: 'Deep text extraction, OCR, 3-level abstraction, interactive quizzes, flashcards, and page-cited RAG Q&A.',
      icon: FileText,
      path: '/documind',
      color: 'border-brand-red/30 hover:border-brand-red',
      badge: 'RAG Powered',
    },
    {
      title: 'DataInsight',
      tagline: 'Tabular Analytics & Visualizations',
      desc: 'Automatic data profiling, smart chart recommendations, auto-cleaning, and conversational queries with formula transparency.',
      icon: BarChart3,
      path: '/datainsight',
      color: 'border-brand-orange/30 hover:border-brand-orange',
      badge: 'Smart Analytics',
    },
    {
      title: 'SmartTools',
      tagline: '30+ Document & Media Utilities',
      desc: 'Comprehensive PDF manipulation, conversion, OCR scanning, watermarking, encryption, and productivity utilities.',
      icon: Wrench,
      path: '/smarttools',
      color: 'border-zinc-700/50 hover:border-brand-red/60',
      badge: '30+ Tools',
    },
  ];

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <Badge variant="secondary" className="px-3.5 py-1">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen AI Document Intelligence
        </Badge>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-light-heading dark:text-white">
          Intelligent Document & Data Processing at <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-orange to-brand-red">Light Speed</span>
        </h1>
        <p className="text-base sm:text-lg text-light-text dark:text-dark-text-secondary leading-relaxed max-w-2xl mx-auto">
          Extract deep knowledge, summarize across 3 abstraction levels, chat with citations, profile tabular datasets, and access 30+ precision document utilities.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/documind">
            <Button size="lg" variant="primary" className="gap-2">
              Launch DocuMind <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/smarttools">
            <Button size="lg" variant="outline">
              Explore 30+ SmartTools
            </Button>
          </Link>
        </div>
      </section>

      {/* 3 Core Modules */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.title} to={m.path} className="group">
              <Card hoverEffect className={`h-full flex flex-col justify-between ${m.color}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-light-surface dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center justify-center text-brand-red dark:text-brand-red-bright group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="primary">{m.badge}</Badge>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-light-heading dark:text-white group-hover:text-brand-red dark:group-hover:text-brand-red-bright transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs font-medium text-brand-orange dark:text-brand-orange-bright mt-0.5">
                      {m.tagline}
                    </p>
                  </div>
                  <p className="text-sm text-light-text dark:text-dark-text-secondary leading-relaxed">
                    {m.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-semibold text-brand-red dark:text-brand-red-bright gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Enter Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 py-8 border-t border-light-border dark:border-dark-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-red/10 text-brand-red-bright mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-light-heading dark:text-white">Security & Privacy First</h4>
              <p className="text-xs text-light-text dark:text-dark-text-secondary mt-1">Encrypted storage, zero data leakage, and automated scheduled file cleanup.</p>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-orange/10 text-brand-orange-bright mt-0.5">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-light-heading dark:text-white">Trilingual Architecture</h4>
              <p className="text-xs text-light-text dark:text-dark-text-secondary mt-1">Full native script rendering for English, Gujarati, and Hindi with safe line heights.</p>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-zinc-500/10 text-zinc-400 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-light-heading dark:text-white">Pitch-Black Dark Mode</h4>
              <p className="text-xs text-light-text dark:text-dark-text-secondary mt-1">Ultra-sleek OLED-optimized true black theme with vivid red & orange accents.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
