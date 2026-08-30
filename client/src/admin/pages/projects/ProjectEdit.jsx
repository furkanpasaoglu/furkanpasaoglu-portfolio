import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import {
  Button, Field, Input, PageHead, RichEditor, Select, Switch, TagsInput, Textarea,
} from '../../ui';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';
import { isEmptyDoc, toDoc, withHighlights } from '../../../utils/richDocModel';

const localeSchema = z.object({
  title: z.string().min(1, 'Zorunlu').max(200),
  shortDesc: z.string().min(1, 'Zorunlu').max(500),
  longDesc: z.unknown().refine((v) => !isEmptyDoc(toDoc(v)), { message: 'Zorunlu' }),
  status: z.string().min(1, 'Zorunlu').max(64),
  client: z.string().max(200).nullish(),
});

const schema = z.object({
  slug: z.string().min(1, 'Zorunlu').max(128).regex(/^[a-z0-9-]+$/, 'Yalnızca küçük harf ve tire'),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
  color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Geçerli hex renk (#xxxxxx)'),
  typeKey: z.string().min(1, 'Zorunlu').max(64),
  github: z.string().url('Geçerli URL').nullable().or(z.literal('')),
  live: z.string().url('Geçerli URL').nullable().or(z.literal('')),
  tags: z.array(z.string().max(64)),
  dataTr: localeSchema,
  dataEn: localeSchema,
});

const TYPES = ['Backend', 'Full-Stack', 'Frontend', 'Microservices', 'Enterprise', 'Other']
  .map((v) => ({ value: v, label: v }));

const empty = () => ({
  slug: '',
  sortOrder: 0,
  isPublished: false,
  color: '#7c6fff',
  typeKey: 'Backend',
  github: '',
  live: '',
  tags: [],
  dataTr: { title: '', shortDesc: '', longDesc: toDoc(''), status: 'Tamamlandı', client: '' },
  dataEn: { title: '', shortDesc: '', longDesc: toDoc(''), status: 'Completed', client: '' },
});

/**
 * Legacy rows keep a plain-text description and a separate highlights array.
 * Both are folded into one document on load, so nothing is lost — the record
 * simply saves in the new shape the next time it is written.
 */
const localeToDoc = (locale, fallback) => ({
  ...fallback,
  ...locale,
  client: locale?.client ?? '',
  longDesc: withHighlights(toDoc(locale?.longDesc), locale?.highlights),
  highlights: undefined,
});

export default function ProjectEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('tr');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'projects', id],
    queryFn: () => adminApi.getProject(id),
    enabled: !isNew,
  });

  const form = useForm({ initial: empty(), schema });
  const { reset } = form;

  useEffect(() => {
    if (!data) return;
    reset({
      slug: data.slug,
      sortOrder: data.sortOrder ?? 0,
      isPublished: !!data.isPublished,
      color: data.color ?? '#7c6fff',
      typeKey: data.typeKey ?? 'Backend',
      github: data.github ?? '',
      live: data.live ?? '',
      tags: data.tags ?? [],
      dataTr: localeToDoc(data.dataTr, empty().dataTr),
      dataEn: localeToDoc(data.dataEn, empty().dataEn),
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => {
      const payload = {
        ...values,
        github: values.github?.trim() || null,
        live: values.live?.trim() || null,
        dataTr: { ...values.dataTr, client: values.dataTr.client?.trim() || null },
        dataEn: { ...values.dataEn, client: values.dataEn.client?.trim() || null },
      };
      return isNew ? adminApi.createProject(payload) : adminApi.updateProject(id, payload);
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
      qc.invalidateQueries({ queryKey: ['public', 'projects'] });
      toast('Kaydedildi.', 'ok');
      if (isNew && saved?.id) navigate(`/admin/projects/${saved.id}`, { replace: true });
    },
    onError: (e) => toast(e?.data?.title ?? e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const submit = (e) => {
    e?.preventDefault?.();
    const result = form.validate();
    if (!result.ok) {
      toast('Eksik ya da hatalı alanlar var.', 'err');
      return;
    }
    saveMut.mutate(result.data);
  };

  if (isLoading) return <p className="fp-loading">Proje okunuyor…</p>;

  return (
    <form onSubmit={submit}>
      <PageHead eyebrow="İçerik · Proje" title={isNew ? 'Yeni proje' : form.value('dataTr.title') || 'Proje'}>
        <Button onClick={() => navigate('/admin/projects')}>Listeye dön</Button>
        <Button variant="primary" busy={saveMut.isPending} onClick={submit}>
          {isNew ? 'Oluştur' : 'Kaydet'}
        </Button>
      </PageHead>

      <div className="fp-form">
        <section className="fp-panel fp-section">
          <p className="fp-panel-title">Künye</p>

          <div className="fp-grid">
            <Field label="Slug" required htmlFor="slug" error={form.error('slug')}>
              <Input id="slug" mono placeholder="proje-adi" {...form.bind('slug')} />
            </Field>

            <Field label="Sıra" htmlFor="sortOrder" error={form.error('sortOrder')}>
              <Input id="sortOrder" type="number" min="0" {...form.bind('sortOrder', { number: true })} />
            </Field>

            <Field label="Tür" htmlFor="typeKey" error={form.error('typeKey')}>
              <Select id="typeKey" options={TYPES} {...form.bind('typeKey')} />
            </Field>

            <Field label="Renk" htmlFor="color" error={form.error('color')}>
              <div className="fp-inline">
                <input
                  className="fp-color"
                  type="color"
                  value={form.value('color')}
                  onChange={(e) => form.set('color', e.target.value)}
                  aria-label="Renk seç"
                />
                <Input id="color" mono {...form.bind('color')} />
              </div>
            </Field>

            <Field label="GitHub" htmlFor="github" error={form.error('github')}>
              <Input id="github" placeholder="https://github.com/…" {...form.bind('github')} />
            </Field>

            <Field label="Canlı adres" htmlFor="live" error={form.error('live')}>
              <Input id="live" placeholder="https://…" {...form.bind('live')} />
            </Field>
          </div>

          <Field
            label="Etiketler"
            hint="Bağımlılık şemasındaki düğümler bunlardan üretiliyor — dilden bağımsız yaz."
            error={form.error('tags')}
          >
            <TagsInput value={form.value('tags')} onChange={(v) => form.set('tags', v)} />
          </Field>

          <Switch label="Yayında" {...form.bindCheck('isPublished')} />
        </section>

        <section className="fp-panel fp-section">
          <div className="fp-tabs">
            <button type="button" className={tab === 'tr' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('tr')}>Türkçe</button>
            <button type="button" className={tab === 'en' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('en')}>English</button>
          </div>

          <LocaleFields form={form} prefix={tab === 'tr' ? 'dataTr' : 'dataEn'} />
        </section>
      </div>
    </form>
  );
}

function LocaleFields({ form, prefix }) {
  return (
    <>
      <Field label="Başlık" required error={form.error(`${prefix}.title`)}>
        <Input {...form.bind(`${prefix}.title`)} />
      </Field>

      <Field label="Kısa açıklama" required error={form.error(`${prefix}.shortDesc`)}>
        <Textarea rows={2} {...form.bind(`${prefix}.shortDesc`)} />
      </Field>

      <Field
        label="Açıklama"
        required
        hint="Başlık, madde listesi, kalın, italik, kod ve bağlantı kullanabilirsin."
        error={form.error(`${prefix}.longDesc`)}
      >
        <RichEditor
          value={form.value(`${prefix}.longDesc`)}
          onChange={(doc) => form.set(`${prefix}.longDesc`, doc)}
        />
      </Field>

      <div className="fp-grid">
        <Field label="Durum" required error={form.error(`${prefix}.status`)}>
          <Input {...form.bind(`${prefix}.status`)} />
        </Field>
        <Field label="Müşteri" hint="İsteğe bağlı" error={form.error(`${prefix}.client`)}>
          <Input {...form.bind(`${prefix}.client`)} />
        </Field>
      </div>
    </>
  );
}
