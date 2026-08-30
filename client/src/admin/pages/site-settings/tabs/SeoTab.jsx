import { Field, Input, TagsInput, Textarea } from '../../../ui';
import LangTabs from './LangTabs';

export default function SeoTab({ form }) {
  return (
    <LangTabs>
      {(lang) => {
        const p = lang === 'tr' ? 'dataTr' : 'dataEn';
        const keywords = (form.value(`${p}.keywords`) ?? '')
          .split(',').map((k) => k.trim()).filter(Boolean);

        return (
          <>
            <Field label="Sayfa başlığı" required error={form.error(`${p}.title`)}>
              <Input {...form.bind(`${p}.title`)} />
            </Field>

            <Field label="Açıklama" required hint="Arama sonuçlarında görünen metin." error={form.error(`${p}.description`)}>
              <Textarea rows={3} {...form.bind(`${p}.description`)} />
            </Field>

            <Field label="Anahtar kelimeler" hint="Virgülle saklanır; burada tek tek gir.">
              <TagsInput
                value={keywords}
                onChange={(v) => form.set(`${p}.keywords`, v.join(', '))}
              />
            </Field>

            <Field label="OG Locale" hint="Örn. tr_TR" error={form.error(`${p}.ogLocale`)}>
              <Input mono {...form.bind(`${p}.ogLocale`)} />
            </Field>
          </>
        );
      }}
    </LangTabs>
  );
}
