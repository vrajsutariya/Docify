import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, BarChart3, Wrench, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { name: 'DocuMind', path: '/documind', icon: FileText },
    { name: 'DataInsight', path: '/datainsight', icon: BarChart3 },
    { name: 'SmartTools', path: '/smarttools', icon: Wrench },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-light-border dark:border-dark-border bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-brand-orange flex items-center justify-center text-white font-heading font-bold shadow-soft group-hover:scale-105 transition-transform">
            D
          </div>
          <div>
            <span className="font-heading font-bold text-lg tracking-tight text-light-heading dark:text-white">
              Doc<span className="text-brand-red">ify</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-orange/10 text-brand-orange-bright border border-brand-orange/20">
              AI Suite
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-light-surface dark:bg-dark-surface text-brand-red dark:text-brand-red-bright border border-light-border dark:border-dark-border'
                    : 'text-light-text dark:text-dark-text-secondary hover:text-light-heading dark:hover:text-white hover:bg-light-surface/50 dark:hover:bg-dark-surface/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Lang, Theme, Login */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-light-text dark:text-dark-text-secondary mr-1" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              aria-label="Select Language"
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg text-xs py-1 px-2 text-light-heading dark:text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-brand-red"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-light-surface dark:bg-dark-surface">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text-secondary hover:text-light-heading dark:hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-brand-orange-bright" /> : <Moon className="w-4 h-4 text-brand-red" />}
          </button>

          <Button size="sm" variant="primary">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
