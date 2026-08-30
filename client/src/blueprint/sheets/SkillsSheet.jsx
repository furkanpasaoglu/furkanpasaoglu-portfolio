import { useState } from 'react';
import { BANDS, BAND_LABEL, useSkillModel } from '../skillModel';
import CoreView from './skills/CoreView';

/**
 * Capability, read from the centre out: one sector per domain, two rings for
 * the two bands. Both the domains and their order come from the API, so the
 * sheet does not care how many there are.
 */
export default function SkillsSheet({ lang }) {
  const tr = lang === 'tr';
  const [active, setActive] = useState(null);
  const model = useSkillModel(lang);
  const { total, categories, isLoading, isError } = model;

  const activeCat = active !== null ? categories.find((c) => c.id === active) : null;

  return (
    <>
      <div className="bp-eyebrow bp-eyebrow-tight">
        {tr ? 'Yetkinlik' : 'Capability'}
        {total > 0 && (
          <span>
            {total} {tr ? 'kalem' : 'items'} · {categories.length} {tr ? 'alan' : 'domains'}
          </span>
        )}
      </div>

      <div className="bp-fit-head">
        <h2 className="bp-h bp-h-compact">{tr ? 'Çekirdek' : 'The core'}</h2>
        {/* Structure only — the panel carries the reading of it, and saying
            it in both places would just be the same sentence twice. */}
        <p className="bp-fit-hint">
          {tr ? 'Her dilim bir alan, iki halka.' : 'One sector per domain, two rings.'}
        </p>
      </div>

      {isLoading && <p className="bp-loading">{tr ? 'Liste okunuyor…' : 'Reading the list…'}</p>}
      {isError && <p className="bp-empty">{tr ? 'Liste okunamadı.' : 'List could not be read.'}</p>}
      {!isLoading && !isError && total === 0 && (
        <p className="bp-empty">{tr ? 'Henüz kayıt yok.' : 'No entries yet.'}</p>
      )}

      {total > 0 && (
        <CoreView model={model} lang={lang} active={active} onActive={setActive} />
      )}

      {total > 0 && (
        <div className="bp-core-foot">
          <span className="bp-legend">
            {BANDS.map((band) => (
              <span className="bp-legend-item" key={band}>
                <span className={`bp-cell-mark bp-cell-mark-${band}`} />
                {BAND_LABEL[tr ? 'tr' : 'en'][band]}
              </span>
            ))}
          </span>

          <span className="bp-readout" role="status">
            {activeCat
              ? `${activeCat.title} · ${activeCat.items.length} ${tr ? 'kalem' : 'items'}`
              : (tr ? 'Bir dilime gel' : 'Hover a segment')}
          </span>
        </div>
      )}
    </>
  );
}
