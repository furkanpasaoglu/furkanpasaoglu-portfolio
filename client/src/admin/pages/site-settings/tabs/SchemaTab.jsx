import { Field, Input, TagsInput, Textarea } from '../../../ui';
import LangTabs from './LangTabs';

export default function SchemaTab({ form }) {
  return (
    <>
      <div className="fp-grid">
        <Field label="Ad" required error={form.error('schema.firstName')}>
          <Input {...form.bind('schema.firstName')} />
        </Field>
        <Field label="Soyad" required error={form.error('schema.lastName')}>
          <Input {...form.bind('schema.lastName')} />
        </Field>
        <Field label="E-posta" required error={form.error('schema.email')}>
          <Input type="email" {...form.bind('schema.email')} />
        </Field>
        <Field label="Ülke kodu" required hint="ISO, örn. TR" error={form.error('schema.addressCountry')}>
          <Input mono {...form.bind('schema.addressCountry')} />
        </Field>
        <Field label="Oluşturulma tarihi" required hint="YYYY-AA-GG" error={form.error('schema.dateCreated')}>
          <Input mono {...form.bind('schema.dateCreated')} />
        </Field>
      </div>

      <Field label="sameAs" hint="Sosyal profil adresleri — JSON-LD'ye bu şekilde giriyor.">
        <TagsInput
          value={form.value('schema.sameAs') ?? []}
          onChange={(v) => form.set('schema.sameAs', v)}
          placeholder="https://…"
        />
      </Field>

      <hr className="fp-rule" />

      <LangTabs>
        {(lang) => (
          <>
            <Field label="Ünvan" required error={form.error(`schema.jobTitle_${lang}`)}>
              <Input {...form.bind(`schema.jobTitle_${lang}`)} />
            </Field>
            <Field label="Kişi açıklaması" required error={form.error(`schema.personDescription_${lang}`)}>
              <Textarea rows={4} {...form.bind(`schema.personDescription_${lang}`)} />
            </Field>
            <Field label="Şehir" required error={form.error(`schema.addressLocality_${lang}`)}>
              <Input {...form.bind(`schema.addressLocality_${lang}`)} />
            </Field>
            <Field label="Uzmanlık alanları">
              <TagsInput
                value={form.value(`schema.knowsAbout_${lang}`) ?? []}
                onChange={(v) => form.set(`schema.knowsAbout_${lang}`, v)}
              />
            </Field>
            <div className="fp-grid">
              <Field label="Çalıştığı kurum" required error={form.error(`schema.worksForName_${lang}`)}>
                <Input {...form.bind(`schema.worksForName_${lang}`)} />
              </Field>
              <Field label="Mezun olduğu kurum" required error={form.error(`schema.alumniOfName_${lang}`)}>
                <Input {...form.bind(`schema.alumniOfName_${lang}`)} />
              </Field>
            </div>
          </>
        )}
      </LangTabs>
    </>
  );
}
