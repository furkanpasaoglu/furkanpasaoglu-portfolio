import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

const COPY = {
  tr: {
    title: 'Bakımdayız',
    fallback: 'Site şu anda bakım modunda. Yakında geri döneceğiz.',
  },
  en: {
    title: 'Under maintenance',
    fallback: 'The site is currently undergoing maintenance. We will be back shortly.',
  },
};

export default function MaintenancePage({ messageTr, messageEn }) {
  const { lang } = useContext(LanguageContext) ?? { lang: 'en' };
  const copy = COPY[lang] ?? COPY.en;
  const message = (lang === 'tr' ? messageTr : messageEn)?.trim() || copy.fallback;

  return (
    <div
      role="alert"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'radial-gradient(ellipse at top, #1f2937, #0b1120 60%)',
        color: '#e5e7eb',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <div
          aria-hidden
          style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 12px rgba(124, 111, 255, 0.45))',
          }}
        >
          🛠️
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.75rem', letterSpacing: '-0.01em' }}>
          {copy.title}
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.55, color: '#cbd5e1', margin: 0 }}>
          {message}
        </p>
      </div>
    </div>
  );
}
