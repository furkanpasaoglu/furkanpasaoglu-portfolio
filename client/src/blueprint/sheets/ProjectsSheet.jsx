import { useEffect, useMemo, useState } from 'react';
import { usePublicProjects } from '../../hooks/usePublicData';
import { safeUrl } from '../../utils/safeUrl';
import { toDoc, withHighlights } from '../../utils/richDocModel';
import { RichDoc } from '../../utils/RichDoc';

/**
 * SIGNATURE ELEMENT — the dependency graph.
 *
 * Projects are components on the left; the union of their tech tags is the
 * dependency bus on the right. Every wire is real: it exists because that
 * project actually declares that tag. Routing is orthogonal, one channel per
 * component, the way an architecture diagram or a board layout routes traces
 * — not decorative curves.
 *
 * Resting state shows the whole system faintly wired, which is itself true
 * and worth seeing: it reveals which dependencies are shared. Focus one
 * component and only its paths carry current.
 */

// Layout happens in a fixed coordinate space and the SVG is fitted into
// whatever box the sheet gives it, so the diagram never scrolls. The space is
// deliberately wide — a sheet's drawing area is landscape, and a tall thin
// diagram fitted into it would shrink to nothing.
// The width is tuned so the drawing renders at roughly 1:1 in the sheet's
// box: a much wider space would be scaled down and take the type with it.
const VB_W = 1400;
const TOP = 44;
const NODE_X = 6;
const NODE_W = 370;
const NODE_H = 38;
const ROW_H = 45;
const BUS_X0 = 400;
const BUS_STEP = 15;

/** Dependencies run in banks, like a backplane: one bank while the list is
 *  short, two once it would otherwise run off the bottom of the sheet. */
const BANKS = [
  { railX: 570, pinX: 580, labelX: 596 },
  { railX: 960, pinX: 970, labelX: 986 },
];
const BANK_LIMIT = 14;
const LABEL_EM = 7.3; // IBM Plex Mono advance at the label size, in units

export default function ProjectsSheet({ lang, t }) {
  const { data, isLoading, isError } = usePublicProjects(lang);
  const [active, setActive] = useState(null);
  const [openId, setOpenId] = useState(null);
  const narrow = useNarrow();

  const projects = useMemo(() => data ?? [], [data]);

  const techs = useMemo(() => {
    const seen = new Map();
    projects.forEach((p) => (p.tags ?? []).forEach((tag) => {
      const key = tag.trim();
      if (key && !seen.has(key.toLowerCase())) seen.set(key.toLowerCase(), key);
    }));
    return [...seen.values()];
  }, [projects]);

  const layout = useMemo(() => {
    const bankCount = techs.length > BANK_LIMIT ? 2 : 1;
    const perBank = Math.ceil(techs.length / bankCount) || 1;
    const step = Math.min(30, Math.max(18, (projects.length * ROW_H) / perBank));

    // Each dependency knows its bank, its row and therefore its pin.
    const pins = new Map();
    techs.forEach((tag, j) => {
      const bank = BANKS[Math.floor(j / perBank)] ?? BANKS[0];
      pins.set(tag.toLowerCase(), {
        tag,
        bank,
        y: TOP + 12 + (j % perBank) * step,
      });
    });

    const nodes = projects.map((p, i) => ({
      project: p,
      cy: TOP + i * ROW_H + NODE_H / 2,
      y: TOP + i * ROW_H,
      busX: BUS_X0 + i * BUS_STEP,
    }));

    const wires = [];
    nodes.forEach(({ project, cy, busX }) => {
      (project.tags ?? []).forEach((tag) => {
        const pin = pins.get(tag.trim().toLowerCase());
        if (!pin) return;
        wires.push({
          id: `${project.id}-${tag}`,
          projectId: project.id,
          d: `M ${NODE_X + NODE_W} ${cy} H ${busX} V ${pin.y} H ${pin.bank.pinX - 6}`,
          jointX: busX,
          jointY: cy,
        });
      });
    });

    const height = TOP
      + Math.max(projects.length * ROW_H, perBank * step + 14)
      + 24;

    return { nodes, wires, pins, bankCount, height };
  }, [projects, techs]);

  const activeTags = useMemo(() => {
    if (active === null) return null;
    const p = projects.find((x) => x.id === active);
    return new Set((p?.tags ?? []).map((x) => x.trim().toLowerCase()));
  }, [active, projects]);

  const open = projects.find((p) => p.id === openId) ?? null;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpenId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const heading = lang === 'tr' ? 'Bileşenler' : 'Components';

  if (isLoading) {
    return <Frame lang={lang} heading={heading}><p className="bp-loading">{lang === 'tr' ? 'Bağımlılık grafiği çözümleniyor…' : 'Resolving dependency graph…'}</p></Frame>;
  }
  if (isError || projects.length === 0) {
    return (
      <Frame lang={lang} heading={heading}>
        <p className="bp-empty">
          {lang === 'tr'
            ? 'Yayımlanmış proje yok. Admin panelinden ekleyip yayımladığında burada bağlanır.'
            : 'No published projects yet. Add and publish one in the admin panel and it wires up here.'}
        </p>
      </Frame>
    );
  }

  return (
    <Frame lang={lang} heading={heading} count={projects.length} deps={techs.length}>
      {narrow ? (
        <div className="bp-glist">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              className="bp-glist-item"
              style={{ borderLeftColor: p.color }}
              onClick={() => setOpenId(p.id)}
            >
              <span className="bp-glist-title">{p.title}</span>
              <span className="bp-glist-meta">{p.typeKey} · {p.status}</span>
              <span className="bp-chips">
                {(p.tags ?? []).map((tag) => (
                  <span key={tag} className="bp-chip">{tag}</span>
                ))}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bp-graph-wrap">
          <svg
            className="bp-graph"
            viewBox={`0 0 ${VB_W} ${layout.height}`}
            preserveAspectRatio="xMidYMid meet"
            role="group"
            aria-label={lang === 'tr' ? 'Proje bağımlılık şeması' : 'Project dependency diagram'}
          >
            <text className="bp-glabel" x={NODE_X} y={20}>
              {lang === 'tr' ? 'Bileşen' : 'Component'}
            </text>
            {BANKS.slice(0, layout.bankCount).map((bank, i) => (
              <g key={bank.railX}>
                <text className="bp-glabel" x={bank.labelX} y={20}>
                  {lang === 'tr' ? 'Bağımlılık' : 'Dependency'}
                  {layout.bankCount > 1 ? ` ${String.fromCharCode(65 + i)}` : ''}
                </text>
                <line className="bp-grule" x1={bank.railX} y1={TOP} x2={bank.railX} y2={layout.height - 16} />
              </g>
            ))}
            <line className="bp-grule" x1={NODE_X} y1={28} x2={VB_W - 6} y2={28} />

            {layout.wires.map((w) => {
              const live = active !== null && w.projectId === active;
              const mute = active !== null && w.projectId !== active;
              return (
                <path
                  key={w.id}
                  className={`bp-gwire${live ? ' bp-gwire-live' : ''}${mute ? ' bp-gwire-mute' : ''}`}
                  d={w.d}
                  pathLength="1"
                />
              );
            })}

            {active !== null && layout.wires
              .filter((w) => w.projectId === active)
              .map((w) => (
                <rect key={`j-${w.id}`} className="bp-gjoint" x={w.jointX - 1.5} y={w.jointY - 1.5} width="3" height="3" />
              ))}

            {techs.map((tag) => {
              const key = tag.toLowerCase();
              const pin = layout.pins.get(key);
              if (!pin) return null;
              const live = activeTags?.has(key);
              const mute = activeTags && !live;
              return (
                <g key={tag} className={`bp-gtech${live ? ' bp-gtech-live' : ''}${mute ? ' bp-gtech-mute' : ''}`}>
                  {/* Knockout: wires bound for the far bank pass behind these
                      labels, so the label needs its own ground to sit on. */}
                  <rect
                    className="bp-gtech-bg"
                    x={pin.bank.labelX - 5}
                    y={pin.y - 9}
                    width={tag.length * LABEL_EM + 10}
                    height="18"
                  />
                  <rect className="bp-gtech-pin" x={pin.bank.pinX - 3} y={pin.y - 3} width="6" height="6" />
                  <text className="bp-gtech-label" x={pin.bank.labelX} y={pin.y} dominantBaseline="middle">{tag}</text>
                </g>
              );
            })}

            {layout.nodes.map(({ project, y }) => {
              const live = active === project.id;
              const mute = active !== null && !live;
              return (
                <g
                  key={project.id}
                  className={`bp-gnode${live ? ' bp-gnode-live' : ''}${mute ? ' bp-gnode-mute' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${project.title} — ${(project.tags ?? []).join(', ')}`}
                  onMouseEnter={() => setActive(project.id)}
                  onMouseLeave={() => setActive((cur) => (cur === project.id ? null : cur))}
                  onFocus={() => setActive(project.id)}
                  onBlur={() => setActive((cur) => (cur === project.id ? null : cur))}
                  onClick={() => setOpenId(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenId(project.id); }
                  }}
                >
                  <rect className="bp-gnode-box" x={NODE_X} y={y} width={NODE_W} height={NODE_H} />
                  <rect className="bp-gnode-bar" x={NODE_X} y={y} width="3" height={NODE_H} style={{ fill: live ? undefined : project.color }} />
                  <text className="bp-gnode-title" x={NODE_X + 16} y={y + 17}>{clamp(project.title, 38)}</text>
                  <text className="bp-gnode-meta" x={NODE_X + 16} y={y + 30}>
                    {clamp(`${project.typeKey} · ${project.status}`, 44)}
                  </text>
                  <text
                    className="bp-gnode-count"
                    x={NODE_X + NODE_W - 14}
                    y={y + 24}
                    textAnchor="end"
                  >
                    {(project.tags ?? []).length}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {open && (
        <aside className="bp-detail" aria-label={open.title}>
          <div className="bp-detail-top">
            <span className="bp-detail-no">{open.typeKey}</span>
            <span className="bp-detail-no">{open.status}</span>
            <button type="button" className="bp-x" onClick={() => setOpenId(null)}>
              {lang === 'tr' ? 'Kapat' : 'Close'}
            </button>
          </div>

          <h3 className="bp-h">{open.title}</h3>
          <p className="bp-lede">{open.shortDesc}</p>
          <RichDoc
            value={withHighlights(toDoc(open.longDesc), open.highlights)}
            className="bp-doc"
          />

          <div className="bp-spec">
            {open.client && (
              <div className="bp-spec-row">
                <span className="bp-spec-k">{lang === 'tr' ? 'Müşteri' : 'Client'}</span>
                <span className="bp-spec-v">{open.client}</span>
              </div>
            )}
            <div className="bp-spec-row">
              <span className="bp-spec-k">{lang === 'tr' ? 'Bağımlılık' : 'Dependencies'}</span>
              <span className="bp-spec-v">
                <span className="bp-chips">
                  {(open.tags ?? []).map((tag) => <span key={tag} className="bp-chip bp-chip-live">{tag}</span>)}
                </span>
              </span>
            </div>
            {(open.github || open.live) && (
              <div className="bp-spec-row">
                <span className="bp-spec-k">{lang === 'tr' ? 'Kaynak' : 'Source'}</span>
                <span className="bp-spec-v">
                  {open.github && <a className="bp-link" href={safeUrl(open.github)} target="_blank" rel="noopener noreferrer">GitHub</a>}
                  {open.github && open.live && ' · '}
                  {open.live && <a className="bp-link" href={safeUrl(open.live)} target="_blank" rel="noopener noreferrer">{t?.projects?.live ?? (lang === 'tr' ? 'Canlı' : 'Live')}</a>}
                </span>
              </div>
            )}
          </div>
        </aside>
      )}
    </Frame>
  );
}

/** On a diagram sheet the drawing is the content, so the heading stays on one
 *  compact line instead of taking half the frame. */
function Frame({ lang, heading, count, deps, children }) {
  return (
    <>
      <div className="bp-eyebrow bp-eyebrow-tight">
        {lang === 'tr' ? 'Mimari şema' : 'Architecture diagram'}
        {count != null && (
          <span>{count} {lang === 'tr' ? 'bileşen' : 'components'} · {deps} {lang === 'tr' ? 'bağımlılık' : 'dependencies'}</span>
        )}
      </div>

      <div className="bp-fit-head">
        <h2 className="bp-h bp-h-compact">{heading}</h2>
        <p className="bp-fit-hint">
          {lang === 'tr'
            ? 'Bir bileşenin üstüne gel: kullandığı bağımlılıklar hat üzerinden aydınlanır. Ayrıntı için tıkla.'
            : 'Hover a component to light the dependencies it actually pulls in. Click one for the detail.'}
        </p>
      </div>

      {children}
    </>
  );
}

function clamp(text, max) {
  const s = String(text ?? '');
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const on = (e) => setNarrow(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}
