import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

/**
 * What a visitor gets while the site is switched off in the admin panel.
 *
 * Styled inline rather than from the blueprint's stylesheet on purpose: this
 * renders instead of the blueprint, so its chunk — and therefore its CSS —
 * is never loaded. It still speaks the same language: mono type, amber for
 * state, a drawing frame around the sheet.
 */
const COPY = {
  tr: {
    eyebrow: 'Servis dışı',
    title: 'Bakımdayız',
    fallback: 'Site şu anda bakım modunda. Yakında geri döneceğiz.',
  },
  en: {
    eyebrow: 'Out of service',
    title: 'Under maintenance',
    fallback: 'The site is currently under maintenance. We will be back shortly.',
  },
};

const MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

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
        background: '#0a0b0d',
        color: '#c8ccd4',
        fontFamily: MONO,
      }}
    >
      <div style={{ maxWidth: 560, border: '1px solid #23262c', padding: '34px 32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#f0b429',
            marginBottom: 18,
          }}
        >
          <span style={{ width: 7, height: 7, background: '#f0b429' }} aria-hidden="true" />
          {copy.eyebrow}
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#eef1f5',
            margin: '0 0 12px',
          }}
        >
          {copy.title}
        </h1>

        <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}
