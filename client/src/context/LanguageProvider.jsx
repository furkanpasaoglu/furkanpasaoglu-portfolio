import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LanguageContext } from './LanguageContext';
import { publicApi } from '../api/publicApi';
import { tr as staticTr } from './tr';
import { en as staticEn } from './en';

const detectLang = () => {
  const nav = navigator.language || 'en';
  return nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // API-driven translations with static fallback. Same shape as static tr/en
  // so section components keep using `t.hero.greeting` unchanged.
  const { data } = useQuery({
    queryKey: ['public', 'translations', lang],
    queryFn: () => publicApi.getTranslations(lang),
    staleTime: 5 * 60_000,
    placeholderData: lang === 'tr' ? staticTr : staticEn,
    retry: 0,
  });

  const t = data ?? (lang === 'tr' ? staticTr : staticEn);
  const toggleLang = () => setLang((prev) => (prev === 'tr' ? 'en' : 'tr'));

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
