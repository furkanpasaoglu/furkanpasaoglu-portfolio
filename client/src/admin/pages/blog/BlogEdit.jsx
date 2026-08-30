import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, PageHead, RichEditor, Select, Switch, TagsInput } from '../../ui';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';
import { isEmptyDoc, toDoc } from '../../../utils/richDocModel';
import BlogLocaleMeta from './BlogLocaleMeta';

const localeSchema = z.object({
  title: z.string().min(1, 'Zorunlu').max(300),
  excerpt: z.string().min(1, 'Zorunlu').max(1000),
  date: z.string().min(1, 'Zorunlu').max(64),
  readTime: z.number().int().min(1).max(120),
});

const schema = z.object({
  slug: z.string().min(1, 'Zorunlu').max(128).regex(/^[a-z0-9-]+$/, 'Yalnızca küçük harf ve tire'),
  sortOrder: z.number().int().min(0),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  category: z.string().min(1, 'Zorunlu').max(64),
  color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Geçerli hex renk'),
  publishedAt: z.string().nullable().or(z.literal('')),
  tags: z.array(z.string().max(64)),
  dataTr: localeSchema,
  dataEn: localeSchema,
  contentTr: z.unknown().refine((v) => !isEmptyDoc(toDoc(v)), { message: 'Zorunlu' }),
  contentEn: z.unknown().refine((v) => !isEmptyDoc(toDoc(v)), { message: 'Zorunlu' }),
});

const CATEGORIES = ['.NET', 'AI / ML', 'DevOps', 'Architecture', 'Frontend', 'Tools']
  .map((v) => ({ value: v, label: v }));

const empty = () => ({
  slug: '',
  sortOrder: 0,
  isFeatured: false,
  isPublished: false,
  category: '.NET',
  color: '#7c6fff',
  publishedAt: '',
  tags: [],
  dataTr: { title: '', excerpt: '', date: '', readTime: 5 },
  dataEn: { title: '', excerpt: '', date: '', readTime: 5 },
  contentTr: toDoc(''),
  contentEn: toDoc(''),
});

export default function BlogEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('tr');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blog', id],
    queryFn: () => adminApi.getBlog(id),
    enabled: !isNew,
  });

  const form = useForm({ initial: empty(), schema });
  const { reset } = form;

  useEffect(() => {
    if (!data) return;
    reset({
      ...empty(),
      ...data,
      publishedAt: data.publishedAt ?? '',
      tags: data.tags ?? [],
      // Notes written before the editor arrive as a block array.
      contentTr: toDoc(data.contentTr),
      contentEn: toDoc(data.contentEn),
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => {
      const payload = { ...values, publishedAt: values.publishedAt?.trim() ? values.publishedAt : null };
      return isNew ? adminApi.createBlog(payload) : adminApi.updateBlog(id, payload);
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'blog'] });
      qc.invalidateQueries({ queryKey: ['public', 'blog'] });
      toast('Kaydedildi.', 'ok');
      if (isNew && saved?.id) navigate(`/admin/blog/${saved.id}`, { replace: true });
    },
    onError: (e) => toast(e?.data?.title ?? e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const submit = (e) => {
    e?.preventDefault?.();
    const result = form.validate();
    if (!result.ok) { toast('Eksik ya da hatalı alanlar var.', 'err'); return; }
    saveMut.mutate(result.data);
  };

  if (isLoading) return <p className="fp-loading">Not okunuyor…</p>;

  const contentField = tab === 'tr' ? 'contentTr' : 'contentEn';

  return (
    <form onSubmit={submit}>
      <PageHead eyebrow="İçerik · Not" title={isNew ? 'Yeni not' : form.value('dataTr.title') || 'Not'}>
        <Button onClick={() => navigate('/admin/blog')}>Listeye dön</Button>
        <Button variant="primary" busy={saveMut.isPending} onClick={submit}>
          {isNew ? 'Oluştur' : 'Kaydet'}
        </Button>
      </PageHead>

      <div className="fp-form">
        <section className="fp-panel fp-section">
          <p className="fp-panel-title">Künye</p>

          <div className="fp-grid">
            <Field label="Slug" required error={form.error('slug')}>
              <Input mono placeholder="not-adi" {...form.bind('slug')} />
            </Field>
            <Field label="Kategori" error={form.error('category')}>
              <Select options={CATEGORIES} {...form.bind('category')} />
            </Field>
            <Field label="Sıra" error={form.error('sortOrder')}>
              <Input type="number" min="0" {...form.bind('sortOrder', { number: true })} />
            </Field>
            <Field label="Yayın tarihi" hint="YYYY-AA-GG, boş bırakılabilir" error={form.error('publishedAt')}>
              <Input mono placeholder="2026-02-15" {...form.bind('publishedAt')} />
            </Field>
            <Field label="Renk" error={form.error('color')}>
              <div className="fp-inline">
                <input
                  className="fp-color"
                  type="color"
                  value={form.value('color')}
                  onChange={(e) => form.set('color', e.target.value)}
                  aria-label="Renk seç"
                />
                <Input mono {...form.bind('color')} />
              </div>
            </Field>
          </div>

          <Field label="Etiketler" error={form.error('tags')}>
            <TagsInput value={form.value('tags')} onChange={(v) => form.set('tags', v)} />
          </Field>

          <div className="fp-switches">
            <Switch label="Yayında" {...form.bindCheck('isPublished')} />
            <Switch label="Öne çıkan" {...form.bindCheck('isFeatured')} />
          </div>
        </section>

        <section className="fp-panel fp-section">
          <div className="fp-tabs">
            <button type="button" className={tab === 'tr' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('tr')}>Türkçe</button>
            <button type="button" className={tab === 'en' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('en')}>English</button>
          </div>

          <BlogLocaleMeta form={form} prefix={tab === 'tr' ? 'dataTr' : 'dataEn'} />

          <hr className="fp-rule" />

          <Field
            label="Not"
            required
            hint="Başlık, madde listesi, alıntı ve kod bloğu kullanabilirsin."
            error={form.error(contentField)}
          >
            <RichEditor
              value={form.value(contentField)}
              onChange={(doc) => form.set(contentField, doc)}
            />
          </Field>
        </section>
      </div>
    </form>
  );
}
