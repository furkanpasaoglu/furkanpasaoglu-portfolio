import { createContext, useContext, useState, useEffect } from 'react';
import { tr } from './tr';
import { en } from './en';

const LanguageContext = createContext(null);

// Auto-detect browser/system language
const detectLang = () => {
  const nav = navigator.language || 'en';
  return nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  // Keep <html lang> in sync with selected language for screen readers
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = lang === 'tr' ? tr : en;
  const toggleLang = () => setLang((prev) => (prev === 'tr' ? 'en' : 'tr'));

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
