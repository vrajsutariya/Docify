import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DocifyLogo } from '../common/DocifyLogo';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-light-border dark:border-dark-border bg-white dark:bg-black py-6 mt-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-light-body dark:text-dark-body">
        <div className="flex items-center gap-2">
          <DocifyLogo size="xs" animated={true} withGlow={true} />
          <span>
            © {new Date().getFullYear()} <span className="font-semibold text-light-heading dark:text-dark-heading">{t('app.name', 'Docify')}</span> — {t('app.tagline', 'AI-Powered Document & Data Intelligence')}.
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span>Engineered with</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">Cyan AI Design System</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
