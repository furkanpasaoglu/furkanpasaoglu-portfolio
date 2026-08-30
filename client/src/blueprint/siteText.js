/**
 * The site's own prose — the role under the name, the cover's opening
 * paragraph, and the three on the Künye sheet.
 *
 * These are copy, not code, so they live in the `hero` and `about` sections
 * of the translations table and are written in the admin panel. The text
 * below is the fallback: what the site says before anything is stored, and
 * what it falls back to if a field is cleared. Keeping it here means the
 * panel is an override, never a prerequisite.
 */
export const SITE_TEXT = {
  tr: {
    role: 'Kıdemli Yazılım Geliştirici',
    lede: 'Backend sistemleri kuruyorum: .NET, PostgreSQL, kimlik doğrulama ve dağıtım hatları. Baktığın site de onlardan biri — içeriğini yöneten admin paneli, kimlik sunucusu ve kendi HTML’ini üreten render servisi bu repoda duruyor.',
    p1: 'İşimin çoğu görünmeyen tarafta geçiyor: veri modeli, kimlik doğrulama, entegrasyon, dağıtım. Kurumsal sistemlerde çalışıyorum — sipariş akışları, ERP entegrasyonları, servisler arası mesajlaşma.',
    p2: 'Bir şeyi tasarlarken önce sınırları çiziyorum: hangi servis neyi biliyor, hangi veri nerede duruyor, bir şey bozulduğunda ne oluyor. Kod sonra geliyor. Bu portfolyo da öyle kuruldu — içerik veritabanından geliyor, HTML sunucuda üretiliyor, admin paneli aynı API üstünde duruyor.',
    p3: 'İstanbul’dayım, iki dilde çalışıyorum, ve genelde en sıkıcı çözümü seçiyorum — çünkü nöbetteyken uyanan ben oluyorum.',
  },
  en: {
    role: 'Senior Software Developer',
    lede: 'I build backend systems: .NET, PostgreSQL, identity and deployment pipelines. This site is one of them — the admin panel behind its content, the identity server, and the renderer that writes its own HTML all live in this repository.',
    p1: 'Most of my work happens on the side you do not see: data models, authentication, integrations, deployment. I work on enterprise systems — order flows, ERP integrations, service-to-service messaging.',
    p2: 'When I design something I draw the boundaries first: which service knows what, where the data lives, what happens when a piece fails. The code comes after. This portfolio was built the same way — content comes from the database, the HTML is rendered server-side, and the admin panel sits on the same API.',
    p3: 'I am in Istanbul, I work in two languages, and I usually pick the boring solution — because I am the one who gets paged.',
  },
};

/** Where each text is stored, so the panel and the site cannot disagree. */
export const SITE_TEXT_FIELDS = [
  { key: 'role', section: 'hero', prop: 'subtitle', label: 'Ünvan', hint: 'Adın altında ve başlık bloğunda görünür.' },
  { key: 'lede', section: 'hero', prop: 'desc', label: 'Kapak girişi', hint: 'Kapak paftasındaki açılış paragrafı.' },
  { key: 'p1', section: 'about', prop: 'p1', label: 'Künye · 1. paragraf', hint: 'Ne iş yaptığın.' },
  { key: 'p2', section: 'about', prop: 'p2', label: 'Künye · 2. paragraf', hint: 'Nasıl çalıştığın.' },
  { key: 'p3', section: 'about', prop: 'p3', label: 'Künye · 3. paragraf', hint: 'Kapanış.' },
];

const fallback = (lang) => SITE_TEXT[lang === 'tr' ? 'tr' : 'en'];

/** Stored text if there is one, otherwise the default above. */
export const siteText = (t, lang, key) => {
  const field = SITE_TEXT_FIELDS.find((f) => f.key === key);
  const stored = field && t?.[field.section]?.[field.prop];
  return (typeof stored === 'string' && stored.trim()) || fallback(lang)[key];
};
