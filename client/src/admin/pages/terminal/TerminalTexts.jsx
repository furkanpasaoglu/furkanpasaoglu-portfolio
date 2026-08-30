import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/adminApi';
import { Button, Field, Input } from '../../ui';
import { useToast } from '../../ui/hooks';
import { TERMINAL_TEXT, TERMINAL_TEXT_KEYS } from '../../../blueprint/terminalText';

/**
 * The terminal's fixed wording, stored as the `terminal` translation section.
 *
 * A blank field is not an empty string — it means "use the built-in", which
 * is what the placeholder shows. So the panel never has to be filled in for
 * the terminal to read correctly.
 */
const SECTION = 'terminal';
const KEY = ['admin', 'translations', SECTION];

const empty = () => ({ tr: {}, en: {} });

export default function TerminalTexts() {
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('tr');
  const [draft, setDraft] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: KEY,
    // The section may not exist yet; that is a normal state, not a failure.
    queryFn: () => adminApi.getTranslation(SECTION).catch(() => null),
  });

  useEffect(() => {
    if (data === undefined) return;
    setDraft({ tr: data?.dataTr ?? {}, en: data?.dataEn ?? {} });
  }, [data]);

  const saveMut = useMutation({
    mutationFn: () => adminApi.upsertTranslation(SECTION, {
      dataTr: prune(draft.tr),
      dataEn: prune(draft.en),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['admin', 'translations'] });
      qc.invalidateQueries({ queryKey: ['public', 'translations'] });
      toast('Metinler kaydedildi.', 'ok');
    },
    onError: (e) => toast(e?.data?.title ?? e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const set = (key, value) => setDraft((prev) => ({ ...prev, [tab]: { ...prev[tab], [key]: value } }));

  return (
    <section className="fp-panel fp-section">
      <div className="fp-panel-head">
        <span className="fp-panel-title">Terminal metinleri</span>
        <span className="fp-panel-head-spacer" />
        <Button variant="quiet" busy={saveMut.isPending} onClick={() => saveMut.mutate()}>
          Metinleri kaydet
        </Button>
      </div>
      <p className="fp-hint">
        Boş bırakırsan yerleşik metin kullanılır — gri yazı onu gösteriyor.
      </p>

      {isLoading ? <p className="fp-loading">Okunuyor…</p> : (
        <>
          <div className="fp-tabs fp-tabs-inner">
            <button type="button" className={tab === 'tr' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('tr')}>Türkçe</button>
            <button type="button" className={tab === 'en' ? 'fp-tab fp-tab-on' : 'fp-tab'} onClick={() => setTab('en')}>English</button>
          </div>

          {TERMINAL_TEXT_KEYS.map(({ key, label, hint }) => (
            <Field key={key} label={label} hint={hint}>
              <Input
                mono
                value={draft[tab]?.[key] ?? ''}
                placeholder={TERMINAL_TEXT[tab][key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </Field>
          ))}
        </>
      )}
    </section>
  );
}

/** Blank means "fall back", so blanks are not stored at all. */
function prune(obj) {
  return Object.fromEntries(
    Object.entries(obj ?? {}).filter(([, v]) => String(v ?? '').trim() !== ''),
  );
}
