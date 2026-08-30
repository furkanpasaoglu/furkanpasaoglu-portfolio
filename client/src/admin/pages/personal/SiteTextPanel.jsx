import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, RichEditor, Textarea } from '../../ui';
import { useToast } from '../../ui/hooks';
import { isEmptyDoc, toDoc } from '../../../utils/richDocModel';
import {
  LEGACY_ABOUT_PROPS, SITE_TEXT, SITE_TEXT_FIELDS, aboutText, cleanRows, specRows,
} from '../../../blueprint/siteText';

/**
 * The copy the public site opens with: the role under the name, the cover's
 * lede, and the Künye sheet's prose and specification rows.
 *
 * These live in the `hero` and `about` translation sections, which also hold
 * keys this panel does not show, so each section is merged rather than
 * replaced — clearing a field here must not delete a neighbour.
 *
 * A blank field is not an empty string, it means "use the built-in", which is
 * what the placeholder shows. The site never depends on this being filled in.
 */
const SECTIONS = [...new Set(SITE_TEXT_FIELDS.map((f) => f.section))];
const KEY = ['admin', 'translations', 'site-text'];

export default function SiteTextPanel() {
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('tr');
  const [draft, setDraft] = useState({ tr: {}, en: {} });

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const rows = await Promise.all(
        // A section may not exist yet; that is a normal state, not a failure.
        SECTIONS.map((s) => adminApi.getTranslation(s).catch(() => null)),
      );
      return Object.fromEntries(SECTIONS.map((s, i) => [s, rows[i]]));
    },
  });

  useEffect(() => {
    if (!data) return;
    const read = (langKey) => Object.fromEntries(
      SITE_TEXT_FIELDS.map((f) => {
        const section = data[f.section]?.[langKey] ?? {};
        switch (f.kind) {
          // Reads the paragraphs a pre-document record still holds, so the
          // first save here converts them instead of stranding them.
          case 'rich': return [f.key, aboutText(section) ?? ''];
          case 'spec': return [f.key, specRows(section) ?? []];
          default: return [f.key, section[f.prop] ?? ''];
        }
      }),
    );
    setDraft({ tr: read('dataTr'), en: read('dataEn') });
  }, [data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      for (const section of SECTIONS) {
        const fields = SITE_TEXT_FIELDS.filter((f) => f.section === section);

        const merge = (langKey, lang) => {
          const next = { ...(data?.[section]?.[langKey] ?? {}) };

          for (const f of fields) {
            const stored = write(f, draft[lang][f.key]);
            if (stored === null) delete next[f.prop];
            else next[f.prop] = stored;

            // The three paragraphs the document replaced go out with it, so a
            // converted record is not left holding two sources of truth.
            if (f.kind === 'rich') for (const p of LEGACY_ABOUT_PROPS) delete next[p];
          }

          return next;
        };

        await adminApi.upsertTranslation(section, {
          dataTr: merge('dataTr', 'tr'),
          dataEn: merge('dataEn', 'en'),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['admin', 'translations'] });
      qc.invalidateQueries({ queryKey: ['public', 'translations'] });
      toast('Site metinleri kaydedildi.', 'ok');
    },
    onError: (e) => toast(e?.data?.title ?? e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const set = (key, value) => setDraft((p) => ({ ...p, [tab]: { ...p[tab], [key]: value } }));

  return (
    <section className="fp-panel fp-section">
      <div className="fp-panel-head">
        <span className="fp-panel-title">Site metinleri</span>
        <span className="fp-panel-head-spacer" />
        <Button variant="quiet" busy={saveMut.isPending} onClick={() => saveMut.mutate()}>
          Metinleri kaydet
        </Button>
      </div>
      <p className="fp-hint">
        Kapak ve Künye paftalarındaki yazılar. Boş bırakırsan yerleşik metin
        kullanılır — gri yazı onu gösteriyor.
      </p>

      {isLoading ? <p className="fp-loading">Okunuyor…</p> : (
        <>
          <div className="fp-tabs fp-tabs-inner">
            <button type="button" className={tab === 'tr' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('tr')}>Türkçe</button>
            <button type="button" className={tab === 'en' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('en')}>English</button>
          </div>

          {SITE_TEXT_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint}>
              <Editor field={f} lang={tab} value={draft[tab]?.[f.key]} onChange={(v) => set(f.key, v)} />
            </Field>
          ))}
        </>
      )}
    </section>
  );
}

/** The stored form of a draft value, or null to drop the key entirely. */
function write(field, value) {
  switch (field.kind) {
    case 'rich':
      return value && !isEmptyDoc(toDoc(value)) ? value : null;
    case 'spec': {
      const rows = cleanRows(value);
      return rows.length ? rows : null;
    }
    default:
      return value?.trim() || null;
  }
}

function Editor({ field, lang, value, onChange }) {
  switch (field.kind) {
    case 'rich':
      return <RichEditor value={value} onChange={onChange} />;
    case 'spec':
      return <SpecRows value={value ?? []} onChange={onChange} />;
    case 'text':
      return (
        <Textarea
          rows={4}
          value={value ?? ''}
          placeholder={SITE_TEXT[lang][field.key]}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <Input
          value={value ?? ''}
          placeholder={SITE_TEXT[lang][field.key]}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/**
 * The Künye sheet's specification column, as an ordered list of label/value
 * pairs. Rows are positional, so they are keyed and reordered by index.
 */
function SpecRows({ value, onChange }) {
  const patch = (i, key, v) => onChange(value.map((r, j) => (j === i ? { ...r, [key]: v } : r)));

  const move = (i, by) => {
    const to = i + by;
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[i], next[to]] = [next[to], next[i]];
    onChange(next);
  };

  return (
    <div className="fp-kv">
      {value.map((row, i) => (
        <div className="fp-kv-row" key={i}>
          <Input
            className="fp-kv-k"
            placeholder="Etiket"
            value={row.k}
            onChange={(e) => patch(i, 'k', e.target.value)}
          />
          <Input
            className="fp-kv-v"
            placeholder="Değer"
            value={row.v}
            onChange={(e) => patch(i, 'v', e.target.value)}
          />
          <div className="fp-kv-ops">
            <button type="button" className="fp-kv-op" title="Yukarı taşı" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" className="fp-kv-op" title="Aşağı taşı" disabled={i === value.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button type="button" className="fp-kv-op fp-kv-x" title="Satırı sil" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </div>
        </div>
      ))}

      <Button className="fp-kv-add" onClick={() => onChange([...value, { k: '', v: '' }])}>
        Satır ekle
      </Button>
    </div>
  );
}
