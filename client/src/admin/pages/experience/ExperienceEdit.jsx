import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, PageHead, RichEditor, Switch, TagsInput } from '../../ui';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';
import { isEmptyDoc, toDoc, withHighlights } from '../../../utils/richDocModel';

const localeSchema = z.object({
  title: z.string().min(1, 'Zorunlu').max(200),
  company: z.string().min(1, 'Zorunlu').max(200),
  type: z.string().min(1, 'Zorunlu').max(64),
  desc: z.unknown().refine((v) => !isEmptyDoc(toDoc(v)), { message: 'Zorunlu' }),
});

const schema = z.object({
  sortOrder: z.number().int().min(0),
  isEducation: z.boolean(),
  isPublished: z.boolean(),
  period: z.string().min(1, 'Zorunlu').max(64),
  tech: z.array(z.string().max(64)),
  dataTr: localeSchema,
  dataEn: localeSchema,
});

const empty = () => ({
  sortOrder: 0,
  isEducation: false,
  isPublished: false,
  period: '',
  tech: [],
  dataTr: { title: '', company: '', type: 'Tam zamanlı', desc: toDoc('') },
  dataEn: { title: '', company: '', type: 'Full-time', desc: toDoc('') },
});

/** Legacy rows keep plain text plus a highlights array; fold both into one doc. */
const localeToDoc = (locale, fallback) => ({
  ...fallback,
  ...locale,
  desc: withHighlights(toDoc(locale?.desc), locale?.highlights),
  highlights: undefined,
});

export default function ExperienceEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('tr');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'experience', id],
    queryFn: () => adminApi.getExperience(id),
    enabled: !isNew,
  });

  const form = useForm({ initial: empty(), schema });
  const { reset } = form;

  useEffect(() => {
    if (!data) return;
    reset({
      sortOrder: data.sortOrder ?? 0,
      isEducation: !!data.isEducation,
      isPublished: !!data.isPublished,
      period: data.period ?? '',
      tech: data.tech ?? [],
      dataTr: localeToDoc(data.dataTr, empty().dataTr),
      dataEn: localeToDoc(data.dataEn, empty().dataEn),
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => (isNew
      ? adminApi.createExperience(values)
      : adminApi.updateExperience(id, values)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'experience'] });
      qc.invalidateQueries({ queryKey: ['public', 'experience'] });
      toast('Kaydedildi.', 'ok');
      if (isNew && saved?.id) navigate(`/admin/experience/${saved.id}`, { replace: true });
    },
    onError: (e) => toast(e?.data?.title ?? e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const submit = (e) => {
    e?.preventDefault?.();
    const result = form.validate();
    if (!result.ok) { toast('Eksik ya da hatalı alanlar var.', 'err'); return; }
    saveMut.mutate(result.data);
  };

  if (isLoading) return <p className="fp-loading">Kayıt okunuyor…</p>;

  const prefix = tab === 'tr' ? 'dataTr' : 'dataEn';

  return (
    <form onSubmit={submit}>
      <PageHead eyebrow="İçerik · Geçmiş" title={isNew ? 'Yeni kayıt' : form.value('dataTr.title') || 'Kayıt'}>
        <Button onClick={() => navigate('/admin/experience')}>Listeye dön</Button>
        <Button variant="primary" busy={saveMut.isPending} onClick={submit}>
          {isNew ? 'Oluştur' : 'Kaydet'}
        </Button>
      </PageHead>

      <div className="fp-form">
        <section className="fp-panel fp-section">
          <p className="fp-panel-title">Künye</p>

          <div className="fp-grid">
            <Field label="Dönem" required hint="Örn. 06/2021 — Günümüz" error={form.error('period')}>
              <Input mono {...form.bind('period')} />
            </Field>
            <Field label="Sıra" error={form.error('sortOrder')}>
              <Input type="number" min="0" {...form.bind('sortOrder', { number: true })} />
            </Field>
          </div>

          <Field
            label="Teknolojiler"
            hint="Kaydın altında rozet olarak listeleniyor."
            error={form.error('tech')}
          >
            <TagsInput value={form.value('tech')} onChange={(v) => form.set('tech', v)} />
          </Field>

          <div className="fp-switches">
            <Switch label="Eğitim kaydı" {...form.bindCheck('isEducation')} />
            <Switch label="Yayında" {...form.bindCheck('isPublished')} />
          </div>
          <p className="fp-hint">
            Eğitim işaretlenirse kayıt public sitede “Eğitim” grubunda, işaretlenmezse “Deneyim” grubunda görünür.
          </p>
        </section>

        <section className="fp-panel fp-section">
          <div className="fp-tabs">
            <button type="button" className={tab === 'tr' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('tr')}>Türkçe</button>
            <button type="button" className={tab === 'en' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('en')}>English</button>
          </div>

          <div className="fp-grid">
            <Field label="Ünvan" required error={form.error(`${prefix}.title`)}>
              <Input {...form.bind(`${prefix}.title`)} />
            </Field>
            <Field label="Kurum" required error={form.error(`${prefix}.company`)}>
              <Input {...form.bind(`${prefix}.company`)} />
            </Field>
          </div>

          <Field label="Çalışma türü" required hint="Örn. Tam zamanlı, Eğitim" error={form.error(`${prefix}.type`)}>
            <Input {...form.bind(`${prefix}.type`)} />
          </Field>

          <Field
            label="Açıklama"
            required
            hint="Madde listesi de burada — geçmiş paftasındaki ağaç dalları bu listeden çıkıyor."
            error={form.error(`${prefix}.desc`)}
          >
            <RichEditor
              value={form.value(`${prefix}.desc`)}
              onChange={(doc) => form.set(`${prefix}.desc`, doc)}
            />
          </Field>
        </section>
      </div>
    </form>
  );
}
