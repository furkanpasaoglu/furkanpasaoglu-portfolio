import { createContext, useContext, useState } from 'react';
import { tr } from './tr';
import { en } from './en';

const LanguageContext = createContext(null);

// Auto-detect browser/system language
const detectLang = () => {
  const nav = navigator.language || navigator.userLanguage || 'en';
  return nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  const t = lang === 'tr' ? tr : en;
  const toggleLang = () => setLang((prev) => (prev === 'tr' ? 'en' : 'tr'));

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
