import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enLocale from '../locales/en.json';
import guLocale from '../locales/gu.json';
import hiLocale from '../locales/hi.json';

const translations = {
  en: enLocale,
  gu: guLocale,
  hi: hiLocale,
};

export const languages = [
  { code: 'en', label: 'English', script: 'EN', nativeName: 'English' },
  { code: 'gu', label: 'ગુજરાતી', script: 'ગુ', nativeName: 'ગુજરાતી' },
  { code: 'hi', label: 'हिन्दी', script: 'हिં', nativeName: 'हिन्दी' },
];

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const savedLang = localStorage.getItem('docify-lang') || localStorage.getItem('docify_language');
      if (savedLang && translations[savedLang]) {
        return savedLang;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setCurrentLanguage(lang);
      try {
        localStorage.setItem('docify-lang', lang);
        localStorage.setItem('docify_language', lang); // backward compatibility
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    if (currentLanguage === 'gu' || currentLanguage === 'hi') {
      document.body.classList.add('indic-text');
    } else {
      document.body.classList.remove('indic-text');
    }
  }, [currentLanguage]);

  // Dot-notation translation helper with nested lookup and English fallback
  const t = useCallback((path, fallback = '') => {
    if (!path || typeof path !== 'string') return '';
    const keys = path.split('.');

    const resolve = (obj) => {
      let current = obj;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return null;
        }
      }
      return typeof current === 'string' ? current : null;
    };

    // 1. Try current language
    const currentTrans = translations[currentLanguage];
    const match = resolve(currentTrans);
    if (match !== null) return match;

    // 2. Fallback to English
    if (currentLanguage !== 'en') {
      const enMatch = resolve(translations.en);
      if (enMatch !== null) return enMatch;
    }

    // 3. Fallback parameter or last segment
    return fallback || keys[keys.length - 1];
  }, [currentLanguage]);

  const getFontClass = useCallback(() => {
    if (currentLanguage === 'gu') return 'font-heading font-sans leading-indic';
    if (currentLanguage === 'hi') return 'font-heading font-sans leading-indic';
    return 'font-sans';
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        language: currentLanguage, // compatibility alias
        setLanguage,
        changeLanguage: setLanguage, // compatibility alias
        t,
        languages,
        getFontClass,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
