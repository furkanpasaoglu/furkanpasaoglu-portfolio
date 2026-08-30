import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/adminApi';
import { Button, PageHead } from '../../ui';
import { useToast } from '../../ui/hooks';

/**
 * Site metinleri. Each section is a bilingual JSON blob — the public site's
 * prose lives here, so this is where copy is changed without a deploy.
 *
 * JSON is edited as text on purpose: the shapes differ per section and a
 * generated form would fight every new key. The parse error is shown inline
 * and saving is blocked until it is valid.
 */
const LIST_KEY = ['admin', 'translations'];

export default function TranslationsEditor() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: list = [], isLoading } = useQuery({
    queryKey: LIST_KEY,
    queryFn: () => adminApi.listTranslations(),
  });

  const [section, setSection] = useState(null);
  const [trText, setTrText] = useState('');
  const [enText, setEnText] = useState('');
  const [trError, setTrError] = useState(null);
  const [enError, setEnError] = useState(null);

  // `terminal` is a translation like any other, but it has a proper form on
  // the Terminal page. Two doors to the same data is how they drift apart.
  const sections = useMemo(
    () => list.map((t) => t.section).filter((s) => s !== 'terminal'),
    [list],
  );
  const current = list.find((t) => t.section === section);

  useEffect(() => {
    if (!section && sections.length > 0) setSection(sections[0]);
  }, [sections, section]);

  useEffect(() => {
    if (!current) return;
    setTrText(JSON.stringify(current.dataTr ?? {}, null, 2));
    setEnText(JSON.stringify(current.dataEn ?? {}, null, 2));
    setTrError(null);
    setEnError(null);
  }, [current]);

  const saveMut = useMutation({
    mutationFn: ({ key, dataTr, dataEn }) => adminApi.upsertTranslation(key, { dataTr, dataEn }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.invalidateQueries({ queryKey: ['public', 'translations'] });
      toast('Metinler kaydedildi.', 'ok');
    },
    onError: (e) => toast(e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const parse = (text, setError) => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      return parsed;
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const save = () => {
    const dataTr = parse(trText, setTrError);
    const dataEn = parse(enText, setEnError);
    if (dataTr === null || dataEn === null) {
      toast('JSON geçersiz — kaydetmeden önce düzelt.', 'err');
      return;
    }
    saveMut.mutate({ key: section, dataTr, dataEn });
  };

  if (isLoading) return <p className="fp-loading">Metinler okunuyor…</p>;

  return (
    <>
      <PageHead eyebrow="İçerik" title="Metinler">
        <Button variant="primary" busy={saveMut.isPending} onClick={save} disabled={!current}>
          Kaydet
        </Button>
      </PageHead>

      <p className="fp-note">
        Public sitedeki sabit metinler burada duruyor. <strong>about</strong> bölümündeki
        <code> p1 · p2 · p3</code> Künye paftasının paragrafları, <strong>hero</strong> içindeki
        <code> desc</code> ise Kapak paftasının giriş metni.
      </p>

      <div className="fp-tabs">
        {sections.map((s) => (
          <button
            key={s}
            type="button"
            className={s === section ? 'fp-tab fp-tab-on' : 'fp-tab'}
            onClick={() => setSection(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {current && (
        <div className="fp-json-grid">
          <div>
            <span className="fp-label">Türkçe</span>
            <textarea
              className="fp-textarea fp-mono fp-json"
              value={trText}
              onChange={(e) => { setTrText(e.target.value); setTrError(null); }}
              spellCheck="false"
            />
            {trError && <p className="fp-error">{trError}</p>}
          </div>

          <div>
            <span className="fp-label">English</span>
            <textarea
              className="fp-textarea fp-mono fp-json"
              value={enText}
              onChange={(e) => { setEnText(e.target.value); setEnError(null); }}
              spellCheck="false"
            />
            {enError && <p className="fp-error">{enError}</p>}
          </div>
        </div>
      )}
    </>
  );
}
