import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, PageHead } from '../../ui';
import { safeUrl } from '../../../utils/safeUrl';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';

const schema = z.object({
  name: z.string().min(1, 'Zorunlu').max(200),
  email: z.string().email('Geçerli e-posta').max(200),
  location: z.string().min(1, 'Zorunlu').max(200),
  github: z.string().url('Geçerli URL').or(z.literal('')).nullable(),
  linkedin: z.string().url('Geçerli URL').or(z.literal('')).nullable(),
  cvUrl: z.string().max(500).nullable().or(z.literal('')),
});

const empty = () => ({ name: '', email: '', location: '', github: '', linkedin: '', cvUrl: '' });

export default function PersonalEdit() {
  const qc = useQueryClient();
  const toast = useToast();
  const fileRef = useRef(null);

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
      cvUrl: data.cvUrl ?? '',
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => adminApi.updatePersonal({
      ...values,
      github: values.github?.trim() || null,
      linkedin: values.linkedin?.trim() || null,
      cvUrl: values.cvUrl?.trim() || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'personal'] });
      qc.invalidateQueries({ queryKey: ['public', 'personal'] });
      toast('Kaydedildi.', 'ok');
    },
    onError: (e) => toast(e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const uploadMut = useMutation({
    mutationFn: (file) => adminApi.uploadCv(file),
    onSuccess: (res) => {
      if (res?.url) form.set('cvUrl', res.url);
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

  const cvUrl = form.value('cvUrl');

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

        <section className="fp-panel fp-section">
          <p className="fp-panel-title">CV</p>

          <Field
            label="Dosya adresi"
            hint="Yükleyince otomatik dolar. Kaydetmeden kalıcı olmaz."
            error={form.error('cvUrl')}
          >
            <Input mono placeholder="/media/cv.pdf" {...form.bind('cvUrl')} />
          </Field>

          <div className="fp-btns">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="fp-file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadMut.mutate(file);
                e.target.value = '';
              }}
            />
            <Button busy={uploadMut.isPending} onClick={() => fileRef.current?.click()}>
              PDF yükle
            </Button>
            {cvUrl && (
              <a className="fp-btn" href={safeUrl(cvUrl)} target="_blank" rel="noopener noreferrer">
                Mevcut CV'yi aç
              </a>
            )}
          </div>
        </section>
      </div>
    </form>
  );
}
