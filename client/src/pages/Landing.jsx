import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  BarChart3,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
  UploadCloud,
  Cpu,
  Download,
  GraduationCap,
  BookOpen,
  Briefcase,
  TrendingUp,
  Layers,
  Search,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Dropdown } from '../components/common/Dropdown';

export const Landing = () => {
  const { isAuthenticated, guestLogin } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleGuestExplore = async () => {
    await guestLogin();
    navigate('/dashboard');
  };

  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];

  const languageDropdownItems = languages.map((lang) => ({
    id: lang.code,
    label: `${lang.nativeName} (${lang.script})`,
    active: lang.code === currentLanguage,
    onClick: () => setLanguage(lang.code),
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  const modules = [
    {
      id: 'documind',
      title: t('nav.documind', 'DocuMind'),
      tagline: 'Document Intelligence & Multilingual RAG',
      desc: t('modules.documindDesc', 'Deep text extraction, OCR, 3-level abstraction, interactive quizzes, flashcards, and page-cited RAG Q&A.'),
      icon: FileText,
      badge: 'RAG Powered',
      features: [
        '3-Level abstraction (Executive, Key Points, Deep Dive)',
        'Page & paragraph citations with verifiable bounding boxes',
        'Auto-generated flashcards & interactive quizzes',
        'Native Gujarati, Hindi, and English OCR extraction',
      ],
    },
    {
      id: 'datainsight',
      title: t('nav.datainsight', 'DataInsight'),
      tagline: 'Tabular Analytics & Automated Visualizations',
      desc: t('modules.datainsightDesc', 'Tabular dataset profiling, automated charting recommendations, natural language queries, and formula transparency.'),
      icon: BarChart3,
      badge: 'Smart Analytics',
      features: [
        'Instant CSV / Excel profiling & null-audit scoring',
        'One-click automated chart recommendations',
        'Natural language Q&A with formula audit transparency',
        'Auto-cleaning & anomaly detection pipelines',
      ],
    },
    {
      id: 'smarttools',
      title: t('nav.smarttools', 'SmartTools'),
      tagline: '30+ High-Performance Document Utilities',
      desc: t('modules.smarttoolsDesc', 'Comprehensive PDF manipulation, conversion, OCR scanning, watermarking, encryption, and productivity utilities.'),
      icon: Wrench,
      badge: '30+ Tools',
      features: [
        'PDF Merge, Split, Compress, Rotate & Reorder',
        'Bi-directional conversions (PDF, Word, Excel, Images)',
        'AES-256 password protection & digital watermarking',
        'Invoice scanner, QR generator & checksum validators',
      ],
    },
  ];

  const steps = [
    {
      step: '01',
      title: t('landing.step1Title', 'Step 1: Upload File'),
      desc: t('landing.step1Desc', 'Upload PDF, DOCX, TXT, scanned images, or tabular CSV/XLSX files in one drag & drop.'),
      icon: UploadCloud,
    },
    {
      step: '02',
      title: t('landing.step2Title', 'Step 2: Choose AI Mode'),
      desc: t('landing.step2Desc', 'Select Summarize, Page-Cited Chat, Interactive Quiz, Auto-Clean, or 30+ Tools.'),
      icon: Cpu,
    },
    {
      step: '03',
      title: t('landing.step3Title', 'Step 3: Export & Share'),
      desc: t('landing.step3Desc', 'Instantly download cited summaries, interactive charts, or transformed files with 100% privacy.'),
      icon: Download,
    },
  ];

  const personas = [
    {
      name: 'Riya',
      role: 'University Student',
      icon: GraduationCap,
      quote:
        'DocuMind breaks down 90-page research papers into 3-minute executive summaries and creates flashcards for my exam prep.',
      highlight: '90-Page Research Summaries',
    },
    {
      name: 'Mr. Patel',
      role: 'Senior Educator',
      icon: BookOpen,
      quote:
        'Being able to upload textbooks in Gujarati and Hindi and get instant classroom quiz questions is a game-changer.',
      highlight: 'Gujarati & Hindi Quizzes',
    },
    {
      name: 'Amit',
      role: 'Operations Lead',
      icon: Briefcase,
      quote:
        'SmartTools replaces 4 paid subscriptions. I merge client reports, add confidential watermarks, and compress PDFs in seconds.',
      highlight: '30+ Daily PDF Utilities',
    },
    {
      name: 'Neha',
      role: 'Data Analyst',
      icon: TrendingUp,
      quote:
        'DataInsight cleans my messy sales exports automatically and answers questions with visible mathematical formulas.',
      highlight: 'Formula Transparency',
    },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body font-sans transition-colors duration-200">
      {/* 1. Marketing Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-light-border dark:border-dark-border bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-cyan-gradient flex items-center justify-center text-black font-heading font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-xl tracking-tight text-light-heading dark:text-dark-heading">
                Doc<span className="text-accent-dark dark:text-accent-light">ify</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/10 text-accent-dark dark:text-accent-light border border-accent/20">
                AI Suite
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-light-body dark:text-dark-body">
            <a href="#modules" className="hover:text-accent-dark dark:hover:text-accent-light transition-colors">
              Modules
            </a>
            <a href="#how-it-works" className="hover:text-accent-dark dark:hover:text-accent-light transition-colors">
              How It Works
            </a>
            <a href="#personas" className="hover:text-accent-dark dark:hover:text-accent-light transition-colors">
              Use Cases
            </a>
            <a href="#multilingual" className="hover:text-accent-dark dark:hover:text-accent-light transition-colors">
              Multilingual
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <Dropdown
              align="right"
              items={languageDropdownItems}
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-accent text-light-heading dark:text-dark-heading text-xs font-semibold"
                >
                  <Globe className="w-3.5 h-3.5 text-accent-dark dark:text-accent-light" />
                  <span>{currentLangObj.script}</span>
                  <ChevronDown className="w-3 h-3 text-light-body dark:text-dark-body" />
                </button>
              }
            />

            {/* Dark/Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading hover:border-accent transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-accent-light" /> : <Moon className="w-4 h-4 text-accent-dark" />}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                  {t('app.ctaDashboard', 'Open Dashboard')}
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGuestExplore}
                  leftIcon={Sparkles}
                  className="hidden sm:inline-flex border-accent/40 text-accent-dark dark:text-accent-light"
                >
                  Explore as Guest
                </Button>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('app.ctaSignIn', 'Sign In')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                    {t('app.ctaGetStarted', 'Get Started Free')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* Pill Badge */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <Badge variant="brand" size="md">
                <Sparkles className="w-3.5 h-3.5" />
                {t('landing.introducing', 'Introducing Docify AI Suite')}
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-light-heading dark:text-dark-heading leading-[1.15]"
            >
              {t('app.heroTitle', 'Unlock Knowledge from Any Document or Data with AI')}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-light-body dark:text-dark-body max-w-2xl mx-auto leading-relaxed"
            >
              {t('app.heroSubtitle', 'Experience unified intelligence across documents and tabular data with natural language Q&A, automatic charts, 30+ precision utilities, and native support for English, Gujarati, and Hindi.')}
            </motion.p>

            {/* Action CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link to="/register">
                <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                  {t('app.ctaGetStarted', 'Get Started Free')}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handleGuestExplore}
                leftIcon={Sparkles}
                className="border-accent/40 hover:border-accent text-accent-dark dark:text-accent-light bg-accent/5 hover:bg-accent/10"
              >
                Explore Without Login
              </Button>
              <a href="#modules">
                <Button variant="secondary" size="lg">
                  {t('app.ctaExploreTools', 'Explore Tools')}
                </Button>
              </a>
            </motion.div>

            {/* Trust points */}
            <motion.div
              variants={itemVariants}
              className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-light-body dark:text-dark-body"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                <span>Instant 14-Day Full Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                <span>Local Document Privacy</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive UI Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-2xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-3 sm:p-5 shadow-2xl overflow-hidden"
          >
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-light-border dark:border-dark-border px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-error/80" />
                <span className="w-3 h-3 rounded-full bg-status-warning/80" />
                <span className="w-3 h-3 rounded-full bg-status-success/80" />
                <span className="ml-2 text-xs font-mono text-light-body dark:text-dark-body hidden sm:inline">
                  docify-workspace-v1.0.app
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="sm">
                  Active Session: Multilingual RAG
                </Badge>
              </div>
            </div>

            {/* Mock Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Pillar 1 Preview */}
              <div className="p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-light-heading dark:text-dark-heading">
                    <FileText className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                    <span>DocuMind</span>
                  </div>
                  <span className="text-[10px] font-mono text-accent-dark dark:text-accent-light">p. 14 / § 3</span>
                </div>
                <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/20 text-xs leading-relaxed text-light-heading dark:text-dark-heading">
                  "Executive Abstract: Revenue grew 24.8% YoY driven by enterprise subscriptions."
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-light-body dark:text-dark-body">
                  <span className="w-2 h-2 rounded-full bg-status-success" />
                  <span>3 Citations Verified</span>
                </div>
              </div>

              {/* Pillar 2 Preview */}
              <div className="p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-light-heading dark:text-dark-heading">
                    <BarChart3 className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                    <span>DataInsight</span>
                  </div>
                  <span className="text-[10px] font-mono text-status-success">100% Quality</span>
                </div>
                {/* Mini mock bar chart */}
                <div className="h-14 flex items-end gap-2 pt-2 px-1">
                  <div className="w-1/4 bg-accent/30 rounded-t h-40%" />
                  <div className="w-1/4 bg-accent/50 rounded-t h-60%" />
                  <div className="w-1/4 bg-accent/70 rounded-t h-85%" />
                  <div className="w-1/4 bg-accent rounded-t h-100%" />
                </div>
                <p className="text-[11px] text-light-body dark:text-dark-body truncate">
                  Auto-recommended: Quarterly Growth Trend
                </p>
              </div>

              {/* Pillar 3 Preview */}
              <div className="p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-light-heading dark:text-dark-heading">
                    <Wrench className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                    <span>SmartTools</span>
                  </div>
                  <span className="text-[10px] font-mono text-accent-dark dark:text-accent-light">30+ Suite</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-1.5 rounded bg-light-surface dark:bg-dark-surface text-[11px] flex items-center justify-between">
                    <span>Compress PDF</span>
                    <span className="font-mono text-status-success">-68%</span>
                  </div>
                  <div className="p-1.5 rounded bg-light-surface dark:bg-dark-surface text-[11px] flex items-center justify-between">
                    <span>OCR Multilingual</span>
                    <span className="font-mono text-accent-dark dark:text-accent-light">EN • GU • HI</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Module Showcase (3 Pillar Cards) */}
      <section id="modules" className="py-16 sm:py-24 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="brand">Three Pillars of Docify</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              One Unified Workspace. Zero Context Switching.
            </h2>
            <p className="text-sm text-light-body dark:text-dark-body">
              Seamlessly transition between deep document synthesis, tabular analytics, and precision manipulation without leaving your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.id}
                  hoverable
                  className="flex flex-col justify-between p-6 sm:p-8 space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3.5 rounded-2xl bg-accent/10 text-accent-dark dark:text-accent-light group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="brand" size="sm">
                        {m.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-xl text-light-heading dark:text-dark-heading group-hover:text-accent-dark dark:group-hover:text-accent-light transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-xs font-semibold text-accent-dark/80 dark:text-accent-light/80 mt-1">
                        {m.tagline}
                      </p>
                      <p className="text-xs text-light-body dark:text-dark-body mt-2 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>

                    {/* Features checklist */}
                    <div className="pt-2 space-y-2 border-t border-light-border dark:border-dark-border">
                      {m.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <Check className="w-4 h-4 text-accent-dark dark:text-accent-light shrink-0 mt-0.5" />
                          <span className="text-light-body dark:text-dark-body">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link to={isAuthenticated ? `/${m.id}` : '/register'} className="w-full block">
                      <Button variant="secondary" size="md" className="w-full justify-between" rightIcon={ArrowRight}>
                        Launch {m.title}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. "How It Works" (3 Steps) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-light-surface/40 dark:bg-dark-surface/40 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="brand">Simple & Intuitive</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('landing.howItWorks', 'How It Works')}
            </h2>
            <p className="text-sm text-light-body dark:text-dark-body">
              {t('landing.howItWorksSubtitle', 'Turn complex documents and messy spreadsheets into actionable clarity in 3 intuitive steps')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-soft relative flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono font-extrabold text-2xl text-accent-dark/40 dark:text-accent-light/40">
                        {st.step}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading">
                      {st.title}
                    </h3>
                    <p className="text-xs text-light-body dark:text-dark-body leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. User Personas Highlight */}
      <section id="personas" className="py-16 sm:py-24 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="brand">Built for Real People</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('landing.personasTitle', 'Tailored for Every Workflow')}
            </h2>
            <p className="text-sm text-light-body dark:text-dark-body">
              {t('landing.personasSubtitle', 'See how learners, educators, office professionals, and analysts elevate their work with Docify')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.name} hoverable className="flex flex-col justify-between space-y-4 p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-light-heading dark:text-dark-heading">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-light-body dark:text-dark-body">{p.role}</span>
                      </div>
                    </div>
                    <p className="text-xs text-light-body dark:text-dark-body italic leading-relaxed">
                      "{p.quote}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-light-border dark:border-dark-border">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent/10 text-accent-dark dark:text-accent-light font-semibold">
                      {p.highlight}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Multilingual Preview Showcase */}
      <section id="multilingual" className="py-16 sm:py-24 bg-light-surface/40 dark:bg-dark-surface/40 border-t border-light-border dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="brand" icon={Globe}>
              Multilingual By Design
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
              {t('landing.multilingualTitle', 'First-Class Multilingual Intelligence')}
            </h2>
            <p className="text-sm text-light-body dark:text-dark-body">
              {t('landing.multilingualSubtitle', 'Work natively in English, Gujarati, and Hindi with high-fidelity OCR, script-aware layouts, and regional language RAG answers.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* English Card */}
            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">English (EN)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/10 text-accent-dark dark:text-accent-light font-bold">Standard</span>
              </div>
              <p className="text-xs text-light-body dark:text-dark-body leading-relaxed">
                "Instant document extraction, formula transparency, and high-accuracy PDF manipulation across 30+ precision utilities."
              </p>
            </div>

            {/* Gujarati Card */}
            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-accent/40 dark:border-accent-light/40 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-accent-dark dark:text-accent-light">ગુજરાતી (GU)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent text-white dark:bg-accent-light dark:text-black font-bold">સંપૂર્ણ સમર્થન</span>
              </div>
              <p className="text-xs text-light-body dark:text-dark-body leading-relaxed font-sans">
                "દસ્તાવેજમાંથી કુદરતી ભાષા પ્રશ્નોત્તરી, OCR સ્કેનિંગ, સ્વચાલિત ક્વિઝ અને સંપૂર્ણ સુરક્ષિત પ્રક્રિયા ગુજરાતીમાં ઉપલબ્ધ છે."
              </p>
            </div>

            {/* Hindi Card */}
            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">हिन्दी (HI)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/10 text-accent-dark dark:text-accent-light font-bold">पूर्ण समर्थन</span>
              </div>
              <p className="text-xs text-light-body dark:text-dark-body leading-relaxed font-sans">
                "AI-संचालित दस्तावेज़ विश्लेषण, स्वचालित चार्ट सिफारिशें और बहुभाषी सारांश अब हिंदी में सीधे उपलब्ध हैं।"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="py-20 border-t border-light-border dark:border-dark-border relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
            Ready to Supercharge Your Documents & Data?
          </h2>
          <p className="text-sm sm:text-base text-light-body dark:text-dark-body max-w-xl mx-auto">
            Join thousands of students, educators, and professionals utilizing Docify for seamless AI document synthesis.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                {t('app.ctaGetStarted', 'Get Started Free')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Modern Footer */}
      <footer className="border-t border-light-border dark:border-dark-border py-12 bg-white dark:bg-black transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-gradient flex items-center justify-center text-black font-heading font-extrabold text-base">
                D
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-light-heading dark:text-dark-heading">
                Doc<span className="text-accent-dark dark:text-accent-light">ify</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-light-body dark:text-dark-body">
              <a href="#modules" className="hover:text-accent-dark dark:hover:text-accent-light">DocuMind</a>
              <a href="#modules" className="hover:text-accent-dark dark:hover:text-accent-light">DataInsight</a>
              <a href="#modules" className="hover:text-accent-dark dark:hover:text-accent-light">SmartTools</a>
              <Link to="/login" className="hover:text-accent-dark dark:hover:text-accent-light">Sign In</Link>
              <Link to="/register" className="hover:text-accent-dark dark:hover:text-accent-light">Create Account</Link>
            </div>

            {/* System Status Pill */}
            <div className="flex items-center gap-2 text-xs font-mono text-light-body dark:text-dark-body">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="pt-6 border-t border-light-border dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-light-body/70 dark:text-dark-body/70">
            <div>
              © {new Date().getFullYear()} Docify (SmartDataAbstract AI). All rights reserved.
            </div>
            <div className="font-mono text-[11px]">
              Engineered with <span className="text-accent-dark dark:text-accent-light font-bold">One-Colour Cyan Palette</span> & <span className="font-bold">motion/react</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
