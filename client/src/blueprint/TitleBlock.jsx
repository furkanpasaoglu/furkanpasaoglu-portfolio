import { useEffect, useState } from 'react';
import { sheetLabel, sheetNo, sheetTotal } from './sheetRegistry';

/**
 * The titleblock. Every field here reports something true about where you
 * are — which sheet of how many, the active locale, the clock. It is the
 * page's structure made legible, not a decorative header.
 */
export default function TitleBlock({ sheet, sheets, lang, onLang, onGo, name, role }) {
  const [clock, setClock] = useState(() => utc());

  useEffect(() => {
    const id = window.setInterval(() => setClock(utc()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="bp-title">
      {/* The name is the way back to the cover, the way a drawing set's title
          is the way back to sheet 01. */}
      <button
        type="button"
        className="bp-title-name"
        onClick={() => onGo('index')}
        aria-label={`${name} — ${lang === 'tr' ? 'kapak paftası' : 'cover sheet'}`}
      >
        {name}
      </button>
      <span className="bp-title-role">{role}</span>

      <span className="bp-title-spacer" />

      <span className="bp-title-field">
        <span className="bp-title-key">{lang === 'tr' ? 'Pafta' : 'Sheet'}</span>
        <span className="bp-title-val">
          {sheetNo(sheets, sheet)}/{sheetTotal(sheets)} · {sheetLabel(sheet, lang)}
        </span>
      </span>

      <span className="bp-title-field">
        <span className="bp-title-key">UTC</span>
        <span className="bp-title-val bp-title-val-live">{clock}</span>
      </span>

      <span className="bp-lang">
        {['tr', 'en'].map((code) => (
          <button
            key={code}
            type="button"
            className={code === lang ? 'bp-lang-opt bp-lang-on' : 'bp-lang-opt'}
            aria-pressed={code === lang}
            onClick={() => onLang(code)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </span>
    </header>
  );
}

function utc() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}
