import { isEmptyDoc, toDoc } from '../utils/richDocModel';

/**
 * The site's own copy: the role under the name, the cover's opening
 * paragraph, and the Künye sheet's prose and specification rows.
 *
 * None of this is code, so it lives in the `hero` and `about` sections of the
 * translations table and is written in the admin panel. What is below is the
 * fallback — what the site says before anything is stored, and what it falls
 * back to when a field is cleared. The panel is an override, never a
 * prerequisite.
 */
export const SITE_TEXT = {
  tr: {
    role: 'Kıdemli Yazılım Geliştirici',
    lede: 'Backend sistemleri kuruyorum: .NET, PostgreSQL, kimlik doğrulama ve dağıtım hatları. Baktığın site de onlardan biri — içeriğini yöneten admin paneli, kimlik sunucusu ve kendi HTML’ini üreten render servisi bu repoda duruyor.',
    about: [
      'İşimin çoğu görünmeyen tarafta geçiyor: veri modeli, kimlik doğrulama, entegrasyon, dağıtım. Kurumsal sistemlerde çalışıyorum — sipariş akışları, ERP entegrasyonları, servisler arası mesajlaşma.',
      'Bir şeyi tasarlarken önce sınırları çiziyorum: hangi servis neyi biliyor, hangi veri nerede duruyor, bir şey bozulduğunda ne oluyor. Kod sonra geliyor. Bu portfolyo da öyle kuruldu — içerik veritabanından geliyor, HTML sunucuda üretiliyor, admin paneli aynı API üstünde duruyor.',
      'İstanbul’dayım, iki dilde çalışıyorum, ve genelde en sıkıcı çözümü seçiyorum — çünkü nöbetteyken uyanan ben oluyorum.',
    ].join('\n\n'),
  },
  en: {
    role: 'Senior Software Developer',
    lede: 'I build backend systems: .NET, PostgreSQL, identity and deployment pipelines. This site is one of them — the admin panel behind its content, the identity server, and the renderer that writes its own HTML all live in this repository.',
    about: [
      'Most of my work happens on the side you do not see: data models, authentication, integrations, deployment. I work on enterprise systems — order flows, ERP integrations, service-to-service messaging.',
      'When I design something I draw the boundaries first: which service knows what, where the data lives, what happens when a piece fails. The code comes after. This portfolio was built the same way — content comes from the database, the HTML is rendered server-side, and the admin panel sits on the same API.',
      'I am in Istanbul, I work in two languages, and I usually pick the boring solution — because I am the one who gets paged.',
    ].join('\n\n'),
  },
};

/**
 * Where each piece is stored, so the panel and the site cannot disagree, and
 * what kind of editor it takes.
 */
export const SITE_TEXT_FIELDS = [
  {
    key: 'role', section: 'hero', prop: 'subtitle', kind: 'line',
    label: 'Ünvan', hint: 'Adın altında ve başlık bloğunda görünür.',
  },
  {
    key: 'lede', section: 'hero', prop: 'desc', kind: 'text',
    label: 'Kapak girişi', hint: 'Kapak paftasındaki açılış paragrafı.',
  },
  {
    key: 'about', section: 'about', prop: 'body', kind: 'rich',
    label: 'Künye metni',
    hint: 'Künye paftasının sol sütunu. İlk paragraf giriş olarak dizilir.',
  },
  {
    key: 'spec', section: 'about', prop: 'spec', kind: 'spec',
    label: 'Künye özellikleri',
    hint: 'Sağdaki liste. Boş bırakırsan kayıtlardan çıkarılan varsayılan liste görünür.',
  },
];

/**
 * The Künye prose used to be three separate paragraph props. One document
 * replaced them; a record written before that still carries the old props and
 * is read here rather than migrated.
 */
export const LEGACY_ABOUT_PROPS = ['p1', 'p2', 'p3'];

const fallback = (lang) => SITE_TEXT[lang === 'tr' ? 'tr' : 'en'];

const filled = (value) => (typeof value === 'string' && value.trim() ? value : null);

/** Stored text if there is one, otherwise the built-in above. */
export const siteText = (t, lang, key) => {
  const field = SITE_TEXT_FIELDS.find((f) => f.key === key);
  const stored = field && filled(t?.[field.section]?.[field.prop]);
  return stored ?? fallback(lang)[key];
};

/**
 * The Künye prose out of one language's `about` section, in whichever shape
 * that section happens to hold. Null when it carries no prose, which is the
 * caller's cue to fall back.
 */
export const aboutText = (about) => {
  const body = about?.body;
  if (body && !isEmptyDoc(toDoc(body))) return body;

  const paragraphs = LEGACY_ABOUT_PROPS.map((p) => filled(about?.[p])).filter(Boolean);
  return paragraphs.length ? paragraphs.join('\n\n') : null;
};

/** The Künye prose with the built-in applied. */
export const aboutDoc = (t, lang) => aboutText(t?.about) ?? fallback(lang).about;

/**
 * The Künye sheet's specification rows: an ordered list of label/value pairs,
 * so that column is content rather than code. Null when nothing usable is
 * stored — the sheet then falls back to what it can derive from the records.
 */
export const specRows = (about) => {
  const rows = cleanRows(about?.spec);
  return rows.length ? rows : null;
};

/** Trims a row list and drops the blank ones. Safe on anything. */
export const cleanRows = (rows) => (Array.isArray(rows) ? rows : [])
  .map((r) => ({ k: String(r?.k ?? '').trim(), v: String(r?.v ?? '').trim() }))
  .filter((r) => r.k || r.v);
