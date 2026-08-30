import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, PageHead, Switch, Textarea } from '../../ui';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';

/**
 * One written command. Whatever goes in the body is printed verbatim, one
 * terminal line per line of text — so the box is a plain monospace textarea:
 * what you type is exactly what the visitor sees.
 */

// Kept in step with TerminalRules.Reserved on the server; the server is the
// one that enforces it, this is only so the answer arrives before the save.
const RESERVED = ['help', 'ls', 'cd', 'lang', 'open', 'dotnet', 'reboot', 'clear', 'exit'];

const localeSchema = z.object({
  summary: z.string().min(1, 'Zorunlu').max(120),
  body: z.string().min(1, 'Zorunlu').max(4000),
});

const schema = z.object({
  name: z.string()
    .min(1, 'Zorunlu')
    .max(32)
    .regex(/^[a-z0-9][a-z0-9._-]*$/, 'Küçük harf, rakam ve . _ - ; boşluk olamaz')
    .refine((v) => !RESERVED.includes(v), { message: 'Bu ad yerleşik bir komuta ait' }),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
  dataTr: localeSchema,
  dataEn: localeSchema,
});

const empty = () => ({
  name: '',
  sortOrder: 0,
  isPublished: false,
  dataTr: { summary: '', body: '' },
  dataEn: { summary: '', body: '' },
});

export default function TerminalCommandEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('tr');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'terminal-commands', id],
    queryFn: () => adminApi.getTerminalCommand(id),
    enabled: !isNew,
  });

  const form = useForm({ initial: empty(), schema });
  const { reset } = form;

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name ?? '',
      sortOrder: data.sortOrder ?? 0,
      isPublished: !!data.isPublished,
      dataTr: { ...empty().dataTr, ...data.dataTr },
      dataEn: { ...empty().dataEn, ...data.dataEn },
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => (isNew
      ? adminApi.createTerminalCommand(values)
      : adminApi.updateTerminalCommand(id, values)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'terminal-commands'] });
      qc.invalidateQueries({ queryKey: ['public', 'terminal-commands'] });
      toast('Kaydedildi.', 'ok');
      if (isNew && saved?.id) navigate(`/admin/terminal/${saved.id}`, { replace: true });
    },
    onError: (e) => toast(e?.data?.title ?? e?.data ?? e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const submit = (e) => {
    e?.preventDefault?.();
    const result = form.validate();
    if (!result.ok) { toast('Eksik ya da hatalı alanlar var.', 'err'); return; }
    saveMut.mutate(result.data);
  };

  if (isLoading) return <p className="fp-loading">Komut okunuyor…</p>;

  const prefix = tab === 'tr' ? 'dataTr' : 'dataEn';
  const name = form.value('name') || 'komut';

  return (
    <form onSubmit={submit}>
      <PageHead eyebrow="İçerik · Terminal" title={isNew ? 'Yeni komut' : form.value('name') || 'Komut'}>
        <Button onClick={() => navigate('/admin/terminal')}>Listeye dön</Button>
        <Button variant="primary" busy={saveMut.isPending} onClick={submit}>
          {isNew ? 'Oluştur' : 'Kaydet'}
        </Button>
      </PageHead>

      <div className="fp-form">
        <section className="fp-panel fp-section">
          <p className="fp-panel-title">Künye</p>

          <div className="fp-grid">
            <Field
              label="Komut"
              required
              hint="Ziyaretçinin yazacağı kelime. Tek parça, küçük harf."
              error={form.error('name')}
            >
              <Input mono placeholder="whoami" {...form.bind('name')} />
            </Field>
            <Field label="Sıra" hint="`help` listesindeki yeri." error={form.error('sortOrder')}>
              <Input type="number" min="0" {...form.bind('sortOrder', { number: true })} />
            </Field>
          </div>

          <Switch label="Yayında" {...form.bindCheck('isPublished')} />
          <p className="fp-hint">
            Yayında değilken komut çalışmaz ve `help` listesinde görünmez.
          </p>
        </section>

        <section className="fp-panel fp-section">
          <div className="fp-tabs">
            <button type="button" className={tab === 'tr' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('tr')}>Türkçe</button>
            <button type="button" className={tab === 'en' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('en')}>English</button>
          </div>

          <Field
            label="Tek satır açıklama"
            required
            hint={`\`help\` çıktısında komutun yanında görünür.`}
            error={form.error(`${prefix}.summary`)}
          >
            <Input {...form.bind(`${prefix}.summary`)} />
          </Field>

          <Field
            label="Cevap"
            required
            hint="Satır satır basılır; girintiler ve boş satırlar korunur."
            error={form.error(`${prefix}.body`)}
          >
            <Textarea mono rows={12} {...form.bind(`${prefix}.body`)} />
          </Field>

          <TerminalPreview name={name} body={form.value(`${prefix}.body`)} />
        </section>
      </div>
    </form>
  );
}

/** The same monospace frame the visitor sees, so the layout can be checked here. */
function TerminalPreview({ name, body }) {
  const lines = String(body ?? '').split('\n');

  return (
    <div className="fp-field">
      <span className="fp-label">Önizleme</span>
      <div className="fp-term-preview">
        <div className="fp-term-line fp-term-in">{`> ${name}`}</div>
        {lines.map((l, i) => (
          <div className="fp-term-line" key={`l${i}`}>{l || ' '}</div>
        ))}
      </div>
    </div>
  );
}
