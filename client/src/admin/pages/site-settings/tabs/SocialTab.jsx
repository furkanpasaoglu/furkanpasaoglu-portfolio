import { Field, Input, Select, Textarea } from '../../../ui';
import LangTabs from './LangTabs';

const CARDS = [
  { value: 'summary', label: 'summary' },
  { value: 'summary_large_image', label: 'summary_large_image' },
];

export default function SocialTab({ form }) {
  return (
    <>
      <LangTabs>
        {(lang) => {
          const p = lang === 'tr' ? 'dataTr' : 'dataEn';
          return (
            <>
              <Field label="OG başlık" required error={form.error(`${p}.ogTitle`)}>
                <Input {...form.bind(`${p}.ogTitle`)} />
              </Field>
              <Field label="OG açıklama" required error={form.error(`${p}.ogDescription`)}>
                <Textarea rows={3} {...form.bind(`${p}.ogDescription`)} />
              </Field>
              <Field label="OG görsel alt metni" required error={form.error(`${p}.ogImageAlt`)}>
                <Input {...form.bind(`${p}.ogImageAlt`)} />
              </Field>
              <Field label="Twitter başlık" required error={form.error(`${p}.twitterTitle`)}>
                <Input {...form.bind(`${p}.twitterTitle`)} />
              </Field>
              <Field label="Twitter açıklama" required error={form.error(`${p}.twitterDescription`)}>
                <Textarea rows={3} {...form.bind(`${p}.twitterDescription`)} />
              </Field>
              <Field label="Site adı" required error={form.error(`${p}.siteName`)}>
                <Input {...form.bind(`${p}.siteName`)} />
              </Field>
            </>
          );
        }}
      </LangTabs>

      <hr className="fp-rule" />

      <Field label="OG görsel adresi">
        <Input mono {...form.bind('branding.ogImageUrl')} />
      </Field>

      <div className="fp-grid">
        <Field label="OG görsel genişlik">
          <Input type="number" {...form.bind('branding.ogImageWidth', { number: true })} />
        </Field>
        <Field label="OG görsel yükseklik">
          <Input type="number" {...form.bind('branding.ogImageHeight', { number: true })} />
        </Field>
      </div>

      <Field label="Twitter görsel adresi">
        <Input mono {...form.bind('branding.twitterImageUrl')} />
      </Field>

      <Field label="Twitter kart türü">
        <Select options={CARDS} {...form.bind('branding.twitterCard')} />
      </Field>
    </>
  );
}
