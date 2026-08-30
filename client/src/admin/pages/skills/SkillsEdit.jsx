import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, PageHead, Select, Switch } from '../../ui';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';

/**
 * Skill categories. The stored grade stays three-valued — the public sheet
 * shows two rings by folding proficient and familiar together, but the
 * distinction is still worth recording here.
 */

const TIERS = [
  { value: 'expert', label: 'İleri — üretimde sahiplendim' },
  { value: 'proficient', label: 'Yetkin — üretimde kullandım' },
  { value: 'familiar', label: 'Aşina — okudum, denedim' },
];

const ICONS = ['dotnet', 'database', 'devops', 'frontend', 'cloud', 'tools']
  .map((v) => ({ value: v, label: v }));

const schema = z.object({
  sortOrder: z.number().int().min(0),
  icon: z.string().min(1, 'Zorunlu').max(64),
  titleTr: z.string().min(1, 'Zorunlu').max(200),
  titleEn: z.string().min(1, 'Zorunlu').max(200),
  isPublished: z.boolean(),
  skills: z.array(z.object({
    name: z.string().min(1, 'Zorunlu').max(120),
    tier: z.enum(['expert', 'proficient', 'familiar']),
  })),
});

const empty = () => ({
  sortOrder: 0,
  icon: 'dotnet',
  titleTr: '',
  titleEn: '',
  isPublished: false,
  skills: [],
});

export default function SkillsEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'skills', id],
    queryFn: () => adminApi.getSkillCategory(id),
    enabled: !isNew,
  });

  const form = useForm({ initial: empty(), schema });
  const { reset } = form;

  useEffect(() => {
    if (!data) return;
    reset({ ...empty(), ...data, skills: data.skills ?? [] });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => (isNew
      ? adminApi.createSkillCategory(values)
      : adminApi.updateSkillCategory(id, values)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'skills'] });
      qc.invalidateQueries({ queryKey: ['public', 'skills'] });
      toast('Kaydedildi.', 'ok');
      if (isNew && saved?.id) navigate(`/admin/skills/${saved.id}`, { replace: true });
    },
    onError: (e) => toast(e?.data?.title ?? e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const submit = (e) => {
    e?.preventDefault?.();
    const result = form.validate();
    if (!result.ok) { toast('Eksik ya da hatalı alanlar var.', 'err'); return; }
    saveMut.mutate(result.data);
  };

  if (isLoading) return <p className="fp-loading">Grup okunuyor…</p>;

  const skills = form.value('skills') ?? [];
  const setSkills = (next) => form.set('skills', next);

  return (
    <form onSubmit={submit}>
      <PageHead eyebrow="İçerik · Yetkinlik" title={isNew ? 'Yeni grup' : form.value('titleTr') || 'Grup'}>
        <Button onClick={() => navigate('/admin/skills')}>Listeye dön</Button>
        <Button variant="primary" busy={saveMut.isPending} onClick={submit}>
          {isNew ? 'Oluştur' : 'Kaydet'}
        </Button>
      </PageHead>

      <div className="fp-form">
        <section className="fp-panel fp-section">
          <p className="fp-panel-title">Grup</p>

          <div className="fp-grid">
            <Field label="Başlık (TR)" required error={form.error('titleTr')}>
              <Input {...form.bind('titleTr')} />
            </Field>
            <Field label="Başlık (EN)" required error={form.error('titleEn')}>
              <Input {...form.bind('titleEn')} />
            </Field>
            <Field label="Simge" error={form.error('icon')}>
              <Select options={ICONS} {...form.bind('icon')} />
            </Field>
            <Field label="Sıra" error={form.error('sortOrder')}>
              <Input type="number" min="0" {...form.bind('sortOrder', { number: true })} />
            </Field>
          </div>

          <Switch label="Yayında" {...form.bindCheck('isPublished')} />
        </section>

        <section className="fp-panel fp-section">
          <div className="fp-repeat-head">
            <p className="fp-panel-title">Kalemler <span className="fp-cellmuted">({skills.length})</span></p>
            <Button variant="quiet" onClick={() => setSkills([...skills, { name: '', tier: 'proficient' }])}>
              Kalem ekle
            </Button>
          </div>

          {skills.length === 0 && <p className="fp-hint">Bu grupta henüz kalem yok.</p>}

          {skills.map((skill, i) => (
            <div className="fp-skill-row" key={`skill-${i}`}>
              <input
                className="fp-input"
                value={skill.name}
                placeholder="Örn. C#"
                onChange={(e) => {
                  const next = [...skills];
                  next[i] = { ...next[i], name: e.target.value };
                  setSkills(next);
                }}
              />
              <select
                className="fp-select"
                value={skill.tier}
                onChange={(e) => {
                  const next = [...skills];
                  next[i] = { ...next[i], tier: e.target.value };
                  setSkills(next);
                }}
              >
                {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <Button variant="quiet" onClick={() => setSkills(skills.filter((_, j) => j !== i))} aria-label="Kaldır">✕</Button>
            </div>
          ))}

          {form.error('skills') && <p className="fp-error">{form.error('skills')}</p>}
        </section>
      </div>
    </form>
  );
}
