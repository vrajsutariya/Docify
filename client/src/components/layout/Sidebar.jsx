import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Wrench,
  Clock,
  Star,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DocifyLogo } from '../common/DocifyLogo';
import { cn } from '../../utils/cn';

export const Sidebar = ({
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  const mainNavigation = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: t('nav.dashboard', 'Dashboard'),
      end: true,
    },
    {
      to: '/documind',
      icon: FileText,
      label: t('nav.documind', 'DocuMind'),
      badge: 'RAG',
    },
    {
      to: '/datainsight',
      icon: BarChart3,
      label: t('nav.datainsight', 'DataInsight'),
      badge: 'Data',
    },
    {
      to: '/smarttools',
      icon: Wrench,
      label: t('nav.smarttools', 'SmartTools'),
      badge: '30+',
    },
  ];

  const secondaryNavigation = [
    {
      to: '/history',
      icon: Clock,
      label: t('nav.history', 'History'),
    },
    {
      to: '/favorites',
      icon: Star,
      label: t('nav.favorites', 'Favorites'),
    },
    {
      to: '/settings',
      icon: Settings,
      label: t('nav.settings', 'Settings'),
    },
    {
      to: '/admin',
      icon: ShieldAlert,
      label: t('nav.admin', 'Admin Panel'),
      badge: 'Admin',
    },
  ];

  const renderNavLink = (item, isMobile = false) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={isMobile ? onCloseMobile : undefined}
        title={collapsed && !isMobile ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 select-none',
            isActive
              ? 'bg-accent/10 text-accent-dark dark:text-accent-light font-semibold border-l-4 border-accent dark:border-accent-light pl-2.5 shadow-xs'
              : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:bg-light-surface dark:hover:bg-dark-surface',
            collapsed && !isMobile && 'justify-center px-0 pl-0 border-l-0'
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn(
                'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                isActive
                  ? 'text-accent-dark dark:text-accent-light'
                  : 'text-light-body dark:text-dark-body group-hover:text-light-heading dark:group-hover:text-dark-heading'
              )}
            />
            {(!collapsed || isMobile) && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {(!collapsed || isMobile) && item.badge && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0',
                  isActive
                    ? 'bg-accent text-white dark:bg-accent-light dark:text-black font-bold'
                    : 'bg-light-surface dark:bg-dark-surface text-light-body dark:text-dark-body border border-light-border dark:border-dark-border'
                )}
              >
                {item.badge}
              </span>
            )}
            {/* Tooltip for collapsed desktop mode */}
            {collapsed && !isMobile && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                {item.label}
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const navContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between">
      {/* Top: Links */}
      <div className="space-y-6">
        {/* Main Section */}
        <div>
          {(!collapsed || isMobile) && (
            <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-light-body/70 dark:text-dark-body/70">
              Core Modules
            </div>
          )}
          <nav className="space-y-1">
            {mainNavigation.map((item) => renderNavLink(item, isMobile))}
          </nav>
        </div>

        {/* Secondary Section */}
        <div>
          {(!collapsed || isMobile) && (
            <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-light-body/70 dark:text-dark-body/70">
              Workspace
            </div>
          )}
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => renderNavLink(item, isMobile))}
          </nav>
        </div>
      </div>

      {/* Bottom: Pro Card & Collapse Toggle */}
      <div className="space-y-3 pt-4 border-t border-light-border dark:border-dark-border">
        {(!collapsed || isMobile) && (
          <div className="p-3 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 shadow-xs">
            <DocifyLogo size="xs" animated={true} withGlow={true} className="mt-0.5" />
            <div className="text-[11px] leading-tight">
              <span className="font-semibold text-light-heading dark:text-dark-heading block">Docify AI Suite</span>
              <span className="text-light-body dark:text-dark-body text-[10px]">Multilingual Intelligence</span>
            </div>
          </div>
        )}

        {/* Collapse toggle (Desktop only) */}
        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? t('common.expandSidebar', 'Expand sidebar') : t('common.collapseSidebar', 'Collapse sidebar')}
            className={cn(
              'w-full flex items-center gap-2 p-2 rounded-xl text-xs text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:bg-light-surface dark:hover:bg-dark-surface transition-colors',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!collapsed && (
              <span className="text-xs font-medium truncate">
                {t('common.collapseSidebar', 'Collapse sidebar')}
              </span>
            )}
            {collapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0 text-accent" />
            ) : (
              <ChevronLeft className="w-4 h-4 shrink-0" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed/Sticky Sidebar */}
      <aside
        className={cn(
          'hidden lg:block shrink-0 border-r border-light-border dark:border-dark-border bg-white dark:bg-black p-4 transition-all duration-300 z-30 select-none sticky top-16 h-[calc(100vh-4rem)]',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {navContent(false)}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with AnimatePresence */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[80vw] bg-white dark:bg-black border-r border-light-border dark:border-dark-border p-4 shadow-2xl flex flex-col justify-between z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-4">
                <div className="flex items-center gap-2.5">
                  <DocifyLogo size="sm" animated={true} withGlow={true} />
                  <span className="font-heading font-bold text-lg text-light-heading dark:text-dark-heading">
                    Doc<span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">ify</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-surface dark:hover:bg-dark-surface"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {navContent(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
