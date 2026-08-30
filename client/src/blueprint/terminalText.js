/**
 * The terminal's own wording. These are defaults, not the truth: the
 * `terminal` section of the translations table overrides any of them, which
 * is what the admin panel writes. Kept here so the panel can show what it is
 * overriding instead of restating it.
 */
export const TERMINAL_TEXT = {
  tr: {
    greeting: '`ls` paftaları listeler, `cd <ad>` açar. `help` tüm komutlar.',
    helpTitle: 'Komutlar:',
    notFound: 'komut bulunamadı',
    notFoundHint: '`help` yazarsan hepsini listelerim.',
  },
  en: {
    greeting: 'Type `ls` to list sheets, `cd <name>` to open one. `help` for everything.',
    helpTitle: 'Commands:',
    notFound: 'command not found',
    notFoundHint: 'Type `help` for the list.',
  },
};

/** What each text is for, in the panel. */
export const TERMINAL_TEXT_KEYS = [
  { key: 'greeting', label: 'Karşılama', hint: 'Terminal açıldığında görünen ilk satır.' },
  { key: 'helpTitle', label: 'Help başlığı', hint: '`help` çıktısının ilk satırı.' },
  { key: 'notFound', label: 'Komut bulunamadı', hint: 'Bilinmeyen komuta verilen hata.' },
  { key: 'notFoundHint', label: 'Bulunamadı ipucu', hint: 'Hatanın altındaki yönlendirme.' },
];

const fallback = (lang) => TERMINAL_TEXT[lang === 'tr' ? 'tr' : 'en'];

/** Stored text if there is one, otherwise the default above. */
export const terminalText = (t, lang, key) =>
  t?.terminal?.[key]?.trim() || fallback(lang)[key];
