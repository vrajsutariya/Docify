import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Search,
  Globe,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
  Command,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../common/Dropdown';

export const Navbar = ({ onOpenMobileSidebar, onOpenSearch }) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, setLanguage, t, languages } = useLanguage();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(2);
  const location = useLocation();
  const navigate = useNavigate();

  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];

  const languageDropdownItems = languages.map((lang) => ({
    id: lang.code,
    label: `${lang.nativeName} (${lang.script})`,
    active: lang.code === currentLanguage,
    icon: lang.code === currentLanguage ? Check : Globe,
    onClick: () => setLanguage(lang.code),
  }));

  const notificationDropdownItems = [
    {
      id: 'n1',
      label: 'DocuMind OCR analysis completed',
      badge: 'New',
      onClick: () => setUnreadCount(0),
    },
    {
      id: 'n2',
      label: 'SmartTools PDF conversion ready to download',
      badge: 'Success',
      onClick: () => setUnreadCount(0),
    },
    { divider: true },
    {
      id: 'clear',
      label: 'Mark all as read',
      onClick: () => setUnreadCount(0),
    },
  ];

  const profileDropdownItems = [
    {
      id: 'user-info',
      label: user?.name ? user.name : 'User Profile',
      badge: user?.role === 'admin' ? 'Admin' : 'Pro',
      disabled: true,
    },
    {
      id: 'profile',
      label: t('common.profile', 'Profile Settings'),
      icon: User,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'settings',
      label: t('nav.settings', 'Settings'),
      icon: Settings,
      onClick: () => navigate('/settings'),
    },
    { divider: true },
    {
      id: 'logout',
      label: t('common.logout', 'Log Out'),
      icon: LogOut,
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-border dark:border-dark-border bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar menu"
            className="lg:hidden p-2 rounded-xl text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            {/* Logo Icon with Cyan Accent Gradient */}
            <div className="w-9 h-9 rounded-xl bg-cyan-gradient flex items-center justify-center text-black font-heading font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
              D
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-tight text-light-heading dark:text-dark-heading">
                  Doc<span className="text-accent-dark dark:text-accent-light">ify</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/10 text-accent-dark dark:text-accent-light border border-accent/20">
                  AI Suite
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar with Ctrl + K hint */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-xs text-light-body dark:text-dark-body hover:border-accent dark:hover:border-accent-light transition-all shadow-sm group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-light-body dark:text-dark-body group-hover:text-accent dark:group-hover:text-accent-light transition-colors" />
              <span className="truncate">{t('common.searchPlaceholder', 'Search tools, docs, analyses... (Ctrl + K)')}</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-light-body dark:text-dark-body bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Language, Theme, Notifications, Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search"
            className="sm:hidden p-2 rounded-xl text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:bg-light-surface dark:hover:bg-dark-surface"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Switcher Dropdown */}
          <Dropdown
            align="right"
            items={languageDropdownItems}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-accent dark:hover:border-accent-light text-light-heading dark:text-dark-heading text-xs font-semibold transition-colors"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-accent-dark dark:text-accent-light" />
                <span>{currentLangObj.script}</span>
                <ChevronDown className="w-3 h-3 text-light-body dark:text-dark-body" />
              </button>
            }
          />

          {/* Dark / Light Theme Toggle with Smooth Icon Flip */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label="Toggle Theme Mode"
            className="p-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading hover:border-accent dark:hover:border-accent-light transition-colors relative"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun className="w-4 h-4 text-accent-light" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon className="w-4 h-4 text-accent-dark" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notification Bell */}
          <Dropdown
            align="right"
            items={notificationDropdownItems}
            trigger={
              <button
                type="button"
                aria-label="Notifications"
                className="relative p-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading hover:border-accent dark:hover:border-accent-light transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            }
          />

          {/* User Profile Menu Button */}
          <Dropdown
            align="right"
            items={profileDropdownItems}
            trigger={
              <button
                type="button"
                aria-label="User menu"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-accent dark:hover:border-accent-light transition-colors"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent-dark dark:text-accent-light flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-status-success ring-2 ring-white dark:ring-black" />
                </div>
                <ChevronDown className="w-3 h-3 text-light-body dark:text-dark-body hidden sm:block" />
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
