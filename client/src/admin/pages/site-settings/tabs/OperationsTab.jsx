import { Field, Input, Switch, Textarea } from '../../../ui';
import LangTabs from './LangTabs';

/**
 * Sheet keys, not the old site's section keys. A missing key counts as
 * visible, so an existing settings row hides nothing on its own.
 *
 * The cover is not listed: it is how the set is entered, and a site whose
 * front page can be switched off is not a state worth supporting.
 */
const SHEETS = [
  { key: 'about', label: '02 Künye' },
  { key: 'projects', label: '03 Projeler' },
  { key: 'experience', label: '04 Geçmiş' },
  { key: 'skills', label: '05 Yetkinlik' },
  { key: 'blog', label: '06 Notlar' },
  { key: 'contact', label: '07 İletişim' },
];

export default function OperationsTab({ form }) {
  const maintenance = !!form.value('operations.maintenanceMode');
  const analytics = !!form.value('operations.analytics.enabled');
  const enabled = form.value('operations.sectionsEnabled') ?? {};

  return (
    <>
      <p className="fp-panel-title">Bakım modu</p>
      <Switch label="Bakım modunu aç" {...form.bindCheck('operations.maintenanceMode')} />

      {maintenance && (
        <p className="fp-warn">
          Public site bakım sayfasıyla değişir. Admin paneli erişilebilir kalır.
        </p>
      )}

      <LangTabs>
        {(lang) => (
          <Field label={lang === 'tr' ? 'Bakım mesajı (TR)' : 'Bakım mesajı (EN)'}>
            <Textarea rows={4} {...form.bind(`operations.maintenanceMessage_${lang}`)} />
          </Field>
        )}
      </LangTabs>

      <hr className="fp-rule" />

      <p className="fp-panel-title">Görünen paftalar</p>
      <p className="fp-hint">Kapatılan pafta public sitede hiç render edilmez; admin'den erişimin sürer.</p>

      <div className="fp-switch-grid">
        {SHEETS.map((s) => (
          <Switch
            key={s.key}
            label={s.label}
            checked={enabled[s.key] !== false}
            onChange={(e) => form.set(`operations.sectionsEnabled.${s.key}`, e.target.checked)}
          />
        ))}
      </div>

      <hr className="fp-rule" />

      <p className="fp-panel-title">Analitik</p>
      <Switch label="Analitik açık" {...form.bindCheck('operations.analytics.enabled')} />

      <div className="fp-grid">
        <Field label="GA4 ölçüm kimliği">
          <Input mono placeholder="G-XXXXXXXXXX" disabled={!analytics} {...form.bind('operations.analytics.ga4MeasurementId')} />
        </Field>
        <Field label="GTM konteyner kimliği">
          <Input mono placeholder="GTM-XXXXXX" disabled={!analytics} {...form.bind('operations.analytics.gtmContainerId')} />
        </Field>
      </div>
    </>
  );
}
