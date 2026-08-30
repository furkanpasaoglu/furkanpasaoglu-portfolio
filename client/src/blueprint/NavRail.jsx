import { sheetLabel, sheetNo } from './sheetRegistry';

/**
 * The minimal technical buttons from the brief. Numbered because the sheets
 * are a fixed, ordered set and the number is how you address one — in the
 * rail, in the titleblock and by keyboard.
 */
export default function NavRail({ sheet, sheets, onGo, lang }) {
  return (
    <nav className="bp-rail" aria-label={lang === 'tr' ? 'Paftalar' : 'Sheets'}>
      {sheets.map((s) => (
        <button
          key={s.key}
          type="button"
          className={s.key === sheet ? 'bp-rail-btn bp-rail-on' : 'bp-rail-btn'}
          aria-current={s.key === sheet ? 'page' : undefined}
          onClick={() => onGo(s.key)}
        >
          <span className="bp-rail-no">{sheetNo(sheets, s.key)}</span>
          {sheetLabel(s.key, lang)}
        </button>
      ))}
    </nav>
  );
}
