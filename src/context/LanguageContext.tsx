import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { translateDynamicText } from '../services/translationService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateAsync: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('fasal_nirnay_lang');
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved as Language;
      }
    } catch (e) {}
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('fasal_nirnay_lang', language);
    } catch (e) {}
  }, [language]);

  const changeLanguage = (lang: Language) => {
    try {
      localStorage.setItem('fasal_nirnay_lang', lang);
      setLanguage(lang);
      window.location.reload();
    } catch (e) {
      setLanguage(lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const val = translations[language]?.[key];
    if (val) return val;

    // Check if key itself is in dictionary values
    const dict = translations[language];
    if (dict && fallback) {
      if (dict[fallback]) return dict[fallback];
    }

    return fallback || key;
  };

  const translateAsync = async (text: string): Promise<string> => {
    return translateDynamicText(text, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, translateAsync }}>
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

// Interactive AutoTranslate component for dynamic backend API strings
export const AutoTranslate: React.FC<{ text: string; fallback?: string }> = ({
  text,
  fallback,
}) => {
  const { language, t, translateAsync } = useLanguage();
  const [translated, setTranslated] = useState(t(text, fallback || text));

  useEffect(() => {
    let isMounted = true;
    const updateTranslation = async () => {
      if (language === 'en') {
        if (isMounted) setTranslated(t(text, fallback || text));
        return;
      }
      // Check static dictionary first
      const staticVal = t(text, fallback);
      if (staticVal && staticVal !== text) {
        if (isMounted) setTranslated(staticVal);
        return;
      }
      // HuggingFace AI translation
      const res = await translateAsync(text || fallback || '');
      if (isMounted) setTranslated(res);
    };

    updateTranslation();

    return () => {
      isMounted = false;
    };
  }, [text, fallback, language]);

  return <>{translated}</>;
};
