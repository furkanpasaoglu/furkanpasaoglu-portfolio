import { Field, Input, Select, Switch } from '../../../ui';

const FREQ = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
  .map((v) => ({ value: v, label: v }));

export default function BrandingTab({ form }) {
  return (
    <>
      <Field label="Kanonik adres" required hint="Sitemap ve canonical etiketleri bundan üretiliyor." error={form.error('branding.canonicalBaseUrl')}>
        <Input mono placeholder="https://furkanpasaoglu.com" {...form.bind('branding.canonicalBaseUrl')} />
      </Field>

      <div className="fp-grid">
        <Field label="Tema rengi" error={form.error('branding.themeColor')}>
          <div className="fp-inline">
            <input
              className="fp-color"
              type="color"
              value={form.value('branding.themeColor') || '#0a0b0d'}
              onChange={(e) => form.set('branding.themeColor', e.target.value)}
              aria-label="Tema rengi"
            />
            <Input mono {...form.bind('branding.themeColor')} />
          </div>
        </Field>

        <Field label="Favicon adresi" error={form.error('branding.faviconUrl')}>
          <Input mono {...form.bind('branding.faviconUrl')} />
        </Field>
      </div>

      <Field label="Google doğrulama kodu" hint="Search Console için; boş bırakılabilir.">
        <Input mono {...form.bind('branding.googleSiteVerification')} />
      </Field>

      <hr className="fp-rule" />

      <div className="fp-switches">
        <Switch label="robots: index" {...form.bindCheck('branding.robotsIndex')} />
        <Switch label="robots: follow" {...form.bindCheck('branding.robotsFollow')} />
      </div>
      <p className="fp-hint">
        İkisini de kapatırsan site arama motorlarına “beni dizine ekleme” der. Yayındaki bir sitede dikkatli ol.
      </p>

      <div className="fp-grid">
        <Field label="Sitemap changefreq">
          <Select options={FREQ} {...form.bind('branding.sitemapChangefreq')} />
        </Field>
        <Field label="Sitemap priority" hint="0 – 1 arası">
          <Input type="number" min="0" max="1" step="0.1" {...form.bind('branding.sitemapPriority', { number: true })} />
        </Field>
      </div>
    </>
  );
}
