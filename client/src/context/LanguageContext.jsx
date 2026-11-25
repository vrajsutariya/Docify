import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('docify_language') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('docify_language', lang);
    document.documentElement.lang = lang;
  };

  const getFontClass = () => {
    if (language === 'gu') return 'font-gujarati leading-multilingual';
    if (language === 'hi') return 'font-devanagari leading-multilingual';
    return 'font-sans leading-relaxed';
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, getFontClass }}>
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
