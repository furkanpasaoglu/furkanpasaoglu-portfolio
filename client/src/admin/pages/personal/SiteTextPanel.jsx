import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input, Textarea } from '../../ui';
import { useToast } from '../../ui/hooks';
import { SITE_TEXT, SITE_TEXT_FIELDS } from '../../../blueprint/siteText';

/**
 * The prose the public site opens with: the role under the name, the cover's
 * lede, and the three paragraphs on the Künye sheet.
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
      SITE_TEXT_FIELDS.map((f) => [f.key, data[f.section]?.[langKey]?.[f.prop] ?? '']),
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
            const value = draft[lang][f.key]?.trim();
            if (value) next[f.prop] = value;
            else delete next[f.prop];
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

          {SITE_TEXT_FIELDS.map(({ key, label, hint }) => (
            <Field key={key} label={label} hint={hint}>
              {key === 'role' ? (
                <Input
                  value={draft[tab]?.[key] ?? ''}
                  placeholder={SITE_TEXT[tab][key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              ) : (
                <Textarea
                  rows={4}
                  value={draft[tab]?.[key] ?? ''}
                  placeholder={SITE_TEXT[tab][key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              )}
            </Field>
          ))}
        </>
      )}
    </section>
  );
}
