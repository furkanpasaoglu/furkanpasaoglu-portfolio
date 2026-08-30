/**
 * Sheet registry. The sheet number is real information — it tells you where
 * you are in a fixed set — so it earns its place in the titleblock and rail.
 *
 * `key` doubles as the terminal argument (`cd projects`) and the URL segment.
 * It names the data the sheet reads, not the heading above it: `blog` is
 * labelled "Notes", and `experience` is labelled "Background" because that
 * sheet carries both work and study.
 *
 * Sheets can be switched off in the admin panel. Everything below therefore
 * works on a *list* rather than the constant: hide one and the rest renumber,
 * because the number means "this one of the ones that exist".
 */
const ALL = [
  { key: 'index', tr: 'Kapak', en: 'Index' },
  { key: 'about', tr: 'Künye', en: 'About' },
  { key: 'projects', tr: 'Projeler', en: 'Projects' },
  { key: 'experience', tr: 'Geçmiş', en: 'Background' },
  { key: 'skills', tr: 'Yetkinlik', en: 'Skills' },
  { key: 'blog', tr: 'Notlar', en: 'Notes' },
  { key: 'contact', tr: 'İletişim', en: 'Contact' },
];

/** The cover is how the set is entered; it is not something to switch off. */
const ALWAYS_ON = ['index'];

/**
 * The sheets a visitor can reach. A key missing from `enabled` counts as
 * visible, so a settings row written before a sheet existed hides nothing.
 */
export const visibleSheets = (enabled) =>
  ALL.filter((s) => ALWAYS_ON.includes(s.key) || enabled?.[s.key] !== false);

export const sheetLabel = (key, lang) => {
  const s = ALL.find((x) => x.key === key);
  if (!s) return lang === 'tr' ? 'Hata' : 'Fault';
  return lang === 'tr' ? s.tr : s.en;
};

export const sheetIndex = (sheets, key) => sheets.findIndex((s) => s.key === key);

export const sheetNo = (sheets, key) => {
  const i = sheetIndex(sheets, key);
  return i < 0 ? '--' : String(i + 1).padStart(2, '0');
};

export const sheetTotal = (sheets) => String(sheets.length).padStart(2, '0');

/**
 * The sheet a name refers to. Exact: a URL that matches nothing is a fault,
 * and the fault sheet is the answer, not a guess.
 */
export const resolveSheet = (sheets, input) => {
  const q = String(input ?? '').trim().toLowerCase();
  return sheets.find((s) => s.key === q)?.key ?? null;
};

/** As above, but a prefix is enough — the completion a shell would give you. */
export const resolveSheetLoose = (sheets, input) => {
  const q = String(input ?? '').trim().toLowerCase();
  if (!q) return null;
  return resolveSheet(sheets, q) ?? sheets.find((s) => s.key.startsWith(q))?.key ?? null;
};
