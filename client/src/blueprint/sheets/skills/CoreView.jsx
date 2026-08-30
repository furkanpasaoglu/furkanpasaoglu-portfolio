import { useMemo, useState } from 'react';
import { BAND_LABEL } from '../../skillModel';

/**
 * A polar reading of the same data: three sectors (the curated domains) by
 * three rings (the grades), centre outward. What you own is at the core;
 * what you have only touched sits on the rim.
 *
 * Skill names are deliberately NOT set around the rings — radial type is
 * unreadable at this size. The diagram carries the shape of the data and the
 * panel beside it carries the names, with the two linked by focus.
 */

const VB_W = 760;
const VB_H = 530;
const CX = 380;
const CY = 262;
const HUB = 34;
/* Two rings, because the reader's question is binary: owned, or worked with.
   The stored grades stay three — this is a reading, not a migration. */
const RINGS = [
  { band: 'core', r0: HUB, r1: 130 },
  { band: 'working', r0: 130, r1: 226 },
];

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

const rimAnchor = (deg) => {
  const c = Math.cos(((deg - 90) * Math.PI) / 180);
  if (c > 0.3) return 'start';
  if (c < -0.3) return 'end';
  return 'middle';
};

const cell = (r0, r1, a0, a1) => {
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} `
    + `L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
};

export default function CoreView({ model, lang, active, onActive }) {
  const tr = lang === 'tr';
  const { categories, total } = model;
  const [cellKey, setCellKey] = useState(null);

  const sectors = useMemo(() => {
    const step = 360 / Math.max(categories.length, 1);
    return categories.map((cat, i) => ({
      ...cat,
      a0: i * step + 1.2,
      a1: (i + 1) * step - 1.2,
      mid: i * step + step / 2,
    }));
  }, [categories]);

  // The panel shows the focused cell, else the focused domain, else the core.
  const shown = useMemo(() => {
    if (cellKey) {
      const [catId, band] = cellKey.split('|');
      const cat = categories.find((c) => String(c.id) === catId);
      return {
        title: `${cat?.title ?? ''} · ${BAND_LABEL[tr ? 'tr' : 'en'][band]}`,
        items: (cat?.items ?? []).filter((s) => s.band === band),
      };
    }
    if (active !== null) {
      const cat = categories.find((c) => c.id === active);
      return { title: cat?.title ?? '', items: cat?.items ?? [] };
    }
    return {
      title: tr ? 'Çekirdek — sahiplendiklerim' : 'The core — what I own',
      items: model.flat.filter((s) => s.tier === 'expert'),
    };
  }, [cellKey, active, categories, model.flat, tr]);

  return (
    <div className="bp-core">
      <div className="bp-core-figure">
      <svg
        className="bp-core-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={tr ? 'Yetkinlik çekirdek diyagramı' : 'Capability core diagram'}
      >
        {sectors.map((sector) => (
          <g key={sector.id}>
            {RINGS.map((ring) => {
              const items = sector.items.filter((s) => s.band === ring.band);
              const key = `${sector.id}|${ring.band}`;
              const live = cellKey === key || (cellKey === null && active === sector.id);
              const mute = (cellKey !== null && cellKey !== key)
                || (cellKey === null && active !== null && active !== sector.id);
              const [lx, ly] = polar((ring.r0 + ring.r1) / 2, sector.mid);

              return (
                <g
                  key={key}
                  className={`bp-core-cell bp-core-cell-${ring.band}`
                    + `${live ? ' bp-core-cell-live' : ''}${mute ? ' bp-core-cell-mute' : ''}`
                    + `${items.length === 0 ? ' bp-core-cell-empty' : ''}`}
                  tabIndex={items.length > 0 ? 0 : undefined}
                  role={items.length > 0 ? 'button' : undefined}
                  aria-label={`${sector.title} — ${BAND_LABEL[tr ? 'tr' : 'en'][ring.band]} — ${items.length}`}
                  onMouseEnter={() => { if (items.length) { setCellKey(key); onActive(sector.id); } }}
                  onMouseLeave={() => { setCellKey(null); onActive(null); }}
                  onFocus={() => { if (items.length) { setCellKey(key); onActive(sector.id); } }}
                  onBlur={() => { setCellKey(null); onActive(null); }}
                >
                  <path className="bp-core-arc" d={cell(ring.r0, ring.r1, sector.a0, sector.a1)} />
                  {items.length > 0 && (
                    <text className="bp-core-num" x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">
                      {items.length}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Domain name on the rim, upright — never set along the arc. */}
            <text
              className="bp-core-sector"
              x={polar(240, sector.mid)[0]}
              y={polar(240, sector.mid)[1]}
              textAnchor={rimAnchor(sector.mid)}
              dominantBaseline="middle"
            >
              {sector.title}
            </text>
          </g>
        ))}

        <circle className="bp-core-hub" cx={CX} cy={CY} r={HUB} />
        <text className="bp-core-hub-num" x={CX} y={CY - 3} textAnchor="middle" dominantBaseline="middle">
          {total}
        </text>
        <text className="bp-core-hub-label" x={CX} y={CY + 12} textAnchor="middle" dominantBaseline="middle">
          {tr ? 'kalem' : 'items'}
        </text>
      </svg>

        {/* Domain key. Easier to hit than a thin arc, and it carries the
            sector names on narrow screens where the rim labels are dropped. */}
        <div className="bp-core-key" role="group" aria-label={tr ? 'Alanlar' : 'Domains'}>
          {sectors.map((sector) => (
            <button
              key={sector.id}
              type="button"
              className={`bp-core-key-btn${active === sector.id ? ' bp-core-key-on' : ''}`}
              aria-pressed={active === sector.id}
              onMouseEnter={() => { setCellKey(null); onActive(sector.id); }}
              onMouseLeave={() => onActive(null)}
              onFocus={() => { setCellKey(null); onActive(sector.id); }}
              onBlur={() => onActive(null)}
            >
              {sector.title}
              <span className="bp-core-key-num">{sector.items.length}</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="bp-core-panel" aria-live="polite">
        <div className="bp-eyebrow bp-eyebrow-tight">
          {shown.title}
          <span>{shown.items.length}</span>
        </div>

        <div className="bp-core-list">
          {shown.items.map((skill) => (
            <span className="bp-cell bp-cell-static" key={`${skill.name}-${skill.categoryId}`}>
              <span className={`bp-cell-mark bp-cell-mark-${skill.band}`} aria-hidden="true" />
              {skill.name}
            </span>
          ))}
        </div>

        <p className="bp-core-note">
          {tr
            ? 'Merkez sahiplendiğim, dış halka değdiğim. Bir dilime gel, adları burada listelenir.'
            : 'The centre is what I own, the rim is what I have touched. Hover a segment and its names land here.'}
        </p>
      </aside>
    </div>
  );
}
