import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Modal } from '../common/Modal';
import { Search, FileText, BarChart3, Wrench, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('docify-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('docify-sidebar-collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut listener for Ctrl + K / ⌘K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchItems = [
    {
      title: t('nav.documind', 'DocuMind'),
      desc: t('modules.documindDesc', 'Document intelligence, OCR, abstraction, and RAG Q&A'),
      path: '/documind',
      icon: FileText,
      badge: 'RAG',
    },
    {
      title: t('nav.datainsight', 'DataInsight'),
      desc: t('modules.datainsightDesc', 'Tabular data analytics, profiling, and chart recommendations'),
      path: '/datainsight',
      icon: BarChart3,
      badge: 'Analytics',
    },
    {
      title: t('nav.smarttools', 'SmartTools'),
      desc: t('modules.smarttoolsDesc', '30+ high-performance PDF manipulation and media utilities'),
      path: '/smarttools',
      icon: Wrench,
      badge: '30+ Tools',
    },
  ];

  const filteredSearchItems = searchQuery.trim()
    ? searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchItems;

  const handleSelectSearchItem = (path) => {
    setSearchModalOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Scrollable Main Workspace View */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {/* Quick Search Modal (Ctrl + K) */}
      <Modal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title={t('common.search', 'Quick Search')}
        description="Jump to any module, utility, or recent document"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.searchPlaceholder', 'Type to search modules or tools...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <p className="text-[11px] font-mono uppercase text-light-body dark:text-dark-body tracking-wider">
              {t('common.recent', 'Suggested Destinations')}
            </p>
            {filteredSearchItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelectSearchItem(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-light-border dark:border-dark-border hover:border-accent dark:hover:border-accent-light bg-light-surface dark:bg-dark-surface text-left transition-all hover:translate-x-0.5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent-dark dark:text-accent-light group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-light-heading dark:text-dark-heading flex items-center gap-2">
                        {item.title}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/15 text-accent-dark dark:text-accent-light font-mono">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-light-body dark:text-dark-body truncate max-w-xs sm:max-w-md">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-light-body dark:text-dark-body group-hover:text-accent dark:group-hover:text-accent-light transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppLayout;
