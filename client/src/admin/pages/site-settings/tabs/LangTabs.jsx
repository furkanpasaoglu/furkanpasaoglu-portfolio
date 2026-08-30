import { useState } from 'react';

/** TR/EN switcher shared by the bilingual settings tabs. */
export default function LangTabs({ children }) {
  const [lang, setLang] = useState('tr');

  return (
    <>
      <div className="fp-tabs fp-tabs-inner">
        <button type="button" className={lang === 'tr' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setLang('tr')}>Türkçe</button>
        <button type="button" className={lang === 'en' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setLang('en')}>English</button>
      </div>
      {children(lang)}
    </>
  );
}
