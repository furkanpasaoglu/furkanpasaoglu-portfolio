import { Field, Input, Textarea } from '../../ui';

export default function BlogLocaleMeta({ form, prefix }) {
  return (
    <>
      <Field label="Başlık" required error={form.error(`${prefix}.title`)}>
        <Input {...form.bind(`${prefix}.title`)} />
      </Field>

      <Field label="Özet" required error={form.error(`${prefix}.excerpt`)}>
        <Textarea rows={3} {...form.bind(`${prefix}.excerpt`)} />
      </Field>

      <div className="fp-grid">
        <Field label="Görünen tarih" required hint="Örn. 15 Şubat 2026" error={form.error(`${prefix}.date`)}>
          <Input {...form.bind(`${prefix}.date`)} />
        </Field>
        <Field label="Okuma süresi (dk)" error={form.error(`${prefix}.readTime`)}>
          <Input type="number" min="1" max="120" {...form.bind(`${prefix}.readTime`, { number: true })} />
        </Field>
      </div>
    </>
  );
}
