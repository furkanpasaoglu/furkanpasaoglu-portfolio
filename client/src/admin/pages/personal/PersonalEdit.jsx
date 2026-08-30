import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, PageHead } from '../../ui';
import SiteTextPanel from './SiteTextPanel';
import { safeUrl } from '../../../utils/safeUrl';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';

const schema = z.object({
  name: z.string().min(1, 'Zorunlu').max(200),
  email: z.string().email('Geçerli e-posta').max(200),
  location: z.string().min(1, 'Zorunlu').max(200),
  github: z.string().url('Geçerli URL').or(z.literal('')).nullable(),
  linkedin: z.string().url('Geçerli URL').or(z.literal('')).nullable(),
  cvUrlTr: z.string().max(500).nullable().or(z.literal('')),
  cvUrlEn: z.string().max(500).nullable().or(z.literal('')),
});

const empty = () => ({ name: '', email: '', location: '', github: '', linkedin: '', cvUrlTr: '', cvUrlEn: '' });

export default function PersonalEdit() {
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'personal'],
    queryFn: () => adminApi.getPersonal(),
  });

  const form = useForm({ initial: empty(), schema });
  const { reset } = form;

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name ?? '',
      email: data.email ?? '',
      location: data.location ?? '',
      github: data.github ?? '',
      linkedin: data.linkedin ?? '',
      cvUrlTr: data.cvUrlTr ?? '',
      cvUrlEn: data.cvUrlEn ?? '',
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => adminApi.updatePersonal({
      ...values,
      github: values.github?.trim() || null,
      linkedin: values.linkedin?.trim() || null,
      cvUrlTr: values.cvUrlTr?.trim() || null,
      cvUrlEn: values.cvUrlEn?.trim() || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'personal'] });
      qc.invalidateQueries({ queryKey: ['public', 'personal'] });
      toast('Kaydedildi.', 'ok');
    },
    onError: (e) => toast(e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const uploadMut = useMutation({
    mutationFn: ({ lang, file }) => adminApi.uploadCv(lang, file).then((r) => ({ ...r, lang })),
    onSuccess: (res) => {
      if (res?.cvUrl) form.set(res.lang === 'tr' ? 'cvUrlTr' : 'cvUrlEn', res.cvUrl);
      toast('CV yüklendi. Kaydetmeyi unutma.', 'ok');
    },
    onError: (e) => toast(e?.message ?? 'Yükleme başarısız.', 'err'),
  });

  const submit = (e) => {
    e?.preventDefault?.();
    const result = form.validate();
    if (!result.ok) { toast('Eksik ya da hatalı alanlar var.', 'err'); return; }
    saveMut.mutate(result.data);
  };

  if (isLoading) return <p className="fp-loading">Künye okunuyor…</p>;


  return (
    <form onSubmit={submit}>
      <PageHead eyebrow="İçerik" title="Künye">
        <Button variant="primary" busy={saveMut.isPending} onClick={submit}>Kaydet</Button>
      </PageHead>

      <div className="fp-form">
        <section className="fp-panel fp-section">
          <p className="fp-panel-title">Kişisel</p>

          <div className="fp-grid">
            <Field label="Ad soyad" required error={form.error('name')}>
              <Input {...form.bind('name')} />
            </Field>
            <Field label="E-posta" required error={form.error('email')}>
              <Input type="email" {...form.bind('email')} />
            </Field>
            <Field label="Konum" required error={form.error('location')}>
              <Input {...form.bind('location')} />
            </Field>
          </div>

          <div className="fp-grid">
            <Field label="GitHub" error={form.error('github')}>
              <Input placeholder="https://github.com/…" {...form.bind('github')} />
            </Field>
            <Field label="LinkedIn" error={form.error('linkedin')}>
              <Input placeholder="https://linkedin.com/in/…" {...form.bind('linkedin')} />
            </Field>
          </div>
        </section>

        <SiteTextPanel />

        <section className="fp-panel fp-section">
          <p className="fp-panel-title">CV</p>
          <p className="fp-hint">
            Ziyaretçi okuduğu dilin CV'sini indirir. Bir dil boşsa diğeri
            verilir, yani en az birini yüklemek yeterli.
          </p>

          <CvSlot
            lang="tr"
            label="Türkçe CV"
            field="cvUrlTr"
            form={form}
            upload={uploadMut}
          />
          <CvSlot
            lang="en"
            label="İngilizce CV"
            field="cvUrlEn"
            form={form}
            upload={uploadMut}
          />
        </section>
      </div>
    </form>
  );
}

/** One language's CV: the stored path, an upload button, and a way to check it. */
function CvSlot({ lang, label, field, form, upload }) {
  const fileRef = useRef(null);
  const url = form.value(field);
  const busy = upload.isPending && upload.variables?.lang === lang;

  return (
    <Field
      label={label}
      hint="Yükleyince adres otomatik dolar. Kaydetmeden kalıcı olmaz."
      error={form.error(field)}
    >
      <Input mono placeholder={`/media/cv-${lang}.pdf`} {...form.bind(field)} />
      <div className="fp-btns">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="fp-file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate({ lang, file });
            e.target.value = '';
          }}
        />
        <Button busy={busy} onClick={() => fileRef.current?.click()}>PDF yükle</Button>
        {url && (
          <a className="fp-btn" href={safeUrl(url)} target="_blank" rel="noopener noreferrer">
            Aç
          </a>
        )}
      </div>
    </Field>
  );
}
