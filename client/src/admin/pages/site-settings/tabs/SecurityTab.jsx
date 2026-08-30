import { Field, TagsInput } from '../../../ui';

/**
 * Content Security Policy. Each directive is a list of sources — edited as
 * chips because that is exactly what they are, and a free-text box would
 * invite the kind of typo that silently breaks the whole site.
 */
const DIRECTIVES = [
  { key: 'defaultSrc', label: 'default-src' },
  { key: 'scriptSrc', label: 'script-src' },
  { key: 'styleSrc', label: 'style-src' },
  { key: 'fontSrc', label: 'font-src' },
  { key: 'imgSrc', label: 'img-src' },
  { key: 'connectSrc', label: 'connect-src' },
  { key: 'frameSrc', label: 'frame-src' },
];

export default function SecurityTab({ form }) {
  return (
    <>
      <p className="fp-panel-title">İçerik güvenlik politikası</p>
      <p className="fp-hint">
        Buradaki değerler üretilen <code>index.html</code>'in CSP başlığına giriyor.
        Bir kaynağı kaldırırsan ilgili varlık sessizce yüklenmez — değişiklikten sonra siteyi kontrol et.
      </p>

      <div className="fp-csp">
        {DIRECTIVES.map((d) => (
          <Field key={d.key} label={d.label}>
            <TagsInput
              value={form.value(`security.csp.${d.key}`) ?? []}
              onChange={(v) => form.set(`security.csp.${d.key}`, v)}
              placeholder="'self'"
            />
          </Field>
        ))}
      </div>

      <hr className="fp-rule" />

      <Field label="robots.txt ek satırları" hint="Her satır dosyaya olduğu gibi ekleniyor.">
        <TagsInput
          value={form.value('security.robotsExtraDirectives') ?? []}
          onChange={(v) => form.set('security.robotsExtraDirectives', v)}
          placeholder="Disallow: /admin"
        />
      </Field>
    </>
  );
}
