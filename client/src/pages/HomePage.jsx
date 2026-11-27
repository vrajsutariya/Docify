import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BarChart3,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  Play,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Dropdown } from '../components/common/Dropdown';
import { Skeleton, CardSkeleton } from '../components/common/Skeleton';
import { Loader } from '../components/common/Loader';
import { DocifyLogo } from '../components/common/DocifyLogo';
import { useLanguage } from '../context/LanguageContext';

export const HomePage = () => {
  const { t, currentLanguage, languages, setLanguage } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(false);

  const modules = [
    {
      title: t('nav.documind', 'DocuMind'),
      tagline: 'Document Intelligence & RAG Chat',
      desc: t('modules.documindDesc', 'Deep text extraction, OCR, 3-level abstraction, interactive quizzes, flashcards, and page-cited RAG Q&A.'),
      icon: FileText,
      path: '/documind',
      badge: 'RAG Powered',
    },
    {
      title: t('nav.datainsight', 'DataInsight'),
      tagline: 'Tabular Analytics & Visualizations',
      desc: t('modules.datainsightDesc', 'Automatic data profiling, smart chart recommendations, auto-cleaning, and conversational queries with formula transparency.'),
      icon: BarChart3,
      path: '/datainsight',
      badge: 'Smart Analytics',
    },
    {
      title: t('nav.smarttools', 'SmartTools'),
      tagline: '30+ Document & Media Utilities',
      desc: t('modules.smarttoolsDesc', 'Comprehensive PDF manipulation, conversion, OCR scanning, watermarking, encryption, and productivity utilities.'),
      icon: Wrench,
      path: '/smarttools',
      badge: '30+ Tools',
    },
  ];

  const handleTestLoading = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        <div className="flex justify-center items-center gap-3">
          <DocifyLogo size="md" animated={true} withGlow={true} />
          <Badge variant="brand" size="md">
            <Sparkles className="w-3.5 h-3.5" />
            {t('app.subtitle', 'Next-Gen Document & Data AI Suite')}
          </Badge>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-light-heading dark:text-dark-heading leading-tight">
          {t('app.name', 'Docify')} —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-dark via-accent to-accent-light dark:from-accent-light dark:via-accent dark:to-cyan-200">
            {t('app.tagline', 'AI-Powered Document & Data Intelligence')}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-light-body dark:text-dark-body max-w-2xl mx-auto leading-relaxed">
          Unified platform combining multilingual RAG document intelligence, tabular analytics with formula auditability, and 30+ precision utilities in a clean high-contrast cyan aesthetic.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/documind">
            <Button variant="primary" size="lg" rightIcon={ArrowRight}>
              {t('common.getStarted', 'Get Started')}
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setModalOpen(true)}
          >
            Launch Modal Demo
          </Button>
          <Button
            variant="outline"
            size="lg"
            isLoading={btnLoading}
            onClick={handleTestLoading}
          >
            {btnLoading ? 'Testing Micro-spinner...' : 'Test Button Spinner'}
          </Button>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-dark dark:text-accent-light" />
            <h2 className="font-heading text-xl font-bold text-light-heading dark:text-dark-heading">
              Core Modules
            </h2>
          </div>
          <span className="text-xs font-mono text-light-body dark:text-dark-body">
            3 Specialized Workspaces
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Card
                key={m.title}
                hoverable
                className="flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="brand" size="sm">
                      {m.badge}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading group-hover:text-accent-dark dark:group-hover:text-accent-light transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-accent-dark/80 dark:text-accent-light/80 font-medium">
                    {m.tagline}
                  </p>
                  <p className="text-xs text-light-body dark:text-dark-body leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <Link to={m.path} className="w-full block">
                    <Button variant="secondary" size="sm" className="w-full justify-between" rightIcon={ArrowRight}>
                      Explore Module
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Reusable Component Library Showcase */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
          <div>
            <h2 className="font-heading text-xl font-bold text-light-heading dark:text-dark-heading">
              UI Component Library & One-Colour Cyan Design System
            </h2>
            <p className="text-xs text-light-body dark:text-dark-body">
              Production-ready, accessible, theme-adaptive components configured with the requested #06B6D4 / #22D3EE cyan palette.
            </p>
          </div>
          <Badge variant="brand">Interactive Showcase</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Buttons Showcase */}
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Button System & Motion States</CardTitle>
              <CardDescription>
                whileHover (scale 1.02) and whileTap (scale 0.98) micro-interactions with loading states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="gradient" size="sm">Gradient</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="danger" size="sm">Danger</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="primary" size="sm" isLoading>Loading</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Badges & Tags */}
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Badge / Tag Matrix</CardTitle>
              <CardDescription>
                Always paired with an icon so status is accessible without relying solely on color
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="brand" icon={Sparkles}>Brand Cyan</Badge>
                <Badge variant="success" icon={CheckCircle2}>Success #22C55E</Badge>
                <Badge variant="warning" icon={AlertTriangle}>Warning #EAB308</Badge>
                <Badge variant="error" icon={XCircle}>Error #DC2626</Badge>
                <Badge variant="info" icon={Info}>Info Notice</Badge>
                <Badge variant="neutral" icon={Clock}>Neutral</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Multilingual & Language Switcher */}
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Multilingual i18n Engine</CardTitle>
              <CardDescription>
                Instant reactivity across English (EN), Gujarati (ગુ), and Hindi (हिં) with dot-notation fallback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {languages.map((l) => (
                  <Button
                    key={l.code}
                    size="sm"
                    variant={currentLanguage === l.code ? 'primary' : 'secondary'}
                    onClick={() => setLanguage(l.code)}
                  >
                    {l.nativeName} ({l.script})
                  </Button>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs space-y-1 font-mono">
                <div><span className="text-light-body dark:text-dark-body">Active Lang:</span> <strong className="text-accent-dark dark:text-accent-light">{currentLanguage}</strong></div>
                <div><span className="text-light-body dark:text-dark-body">t('app.name'):</span> {t('app.name')}</div>
                <div><span className="text-light-body dark:text-dark-body">t('nav.documind'):</span> {t('nav.documind')}</div>
                <div><span className="text-light-body dark:text-dark-body">t('common.upload'):</span> {t('common.upload')}</div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Loaders & Skeleton States */}
          <Card className="space-y-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Loader & Skeleton Pulse</CardTitle>
                <CardDescription>Smooth pulse animations for pending data states</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSkeletonDemo(!showSkeletonDemo)}
              >
                {showSkeletonDemo ? 'Show Loaded' : 'Show Skeleton'}
              </Button>
            </CardHeader>
            <CardContent>
              {showSkeletonDemo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="avatar" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton variant="title" />
                      <Skeleton variant="text" />
                    </div>
                  </div>
                  <Skeleton variant="rect" className="h-16 w-full" />
                </div>
              ) : (
                <div className="flex items-center justify-around py-2">
                  <Loader size="sm" label="Small spinner" />
                  <Loader size="md" label="Medium spinner" />
                  <Loader size="lg" label="Processing query..." />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Interactive Modal Component"
        description="Framer motion animated entrance with backdrop blur and ESC close"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              {t('common.confirm', 'Got It')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            This accessible modal is animated using <code className="text-xs bg-light-surface dark:bg-dark-surface px-1.5 py-0.5 rounded border border-light-border dark:border-dark-border text-accent-dark dark:text-accent-light">motion/react</code>.
          </p>
          <p className="text-xs text-light-body dark:text-dark-body">
            It includes focus trapping, dark overlay with blur (<code className="text-[11px] font-mono">backdrop-blur-sm</code>), ESC key listener, and outside-click dismissal.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
