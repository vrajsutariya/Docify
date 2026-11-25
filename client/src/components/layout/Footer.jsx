import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-light-text dark:text-dark-text-secondary">
        <div>
          © {new Date().getFullYear()} <span className="font-semibold text-light-heading dark:text-white">Docify</span> (SmartDataAbstract AI). All rights reserved.
        </div>
        <div className="flex items-center gap-1">
          <span>Engineered with</span>
          <Heart className="w-3.5 h-3.5 text-brand-red fill-brand-red inline-block" />
          <span>for deep document intelligence.</span>
        </div>
      </div>
    </footer>
  );
};
