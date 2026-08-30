import { useEffect, useRef, useState } from 'react';

/**
 * The boot sequence. 1.5s of real startup facts — the stack in this repo
 * genuinely is .NET 9 on PostgreSQL 17 with 9 EF migrations behind Keycloak,
 * so the log is accurate rather than decorative.
 *
 * Skippable by click, key or reduced-motion preference. Runs once per tab.
 */

export const BOOT_FLAG = 'bp:booted';

const LINES = [
  { at: 0, t: '0.000', msg: 'Loading .NET 9 runtime · linux-x64', st: 'OK' },
  { at: 150, t: '0.147', msg: 'Resolving assembly Portfolio.Api.dll', st: 'OK' },
  { at: 340, t: '0.338', msg: 'Opening Npgsql pool → PostgreSQL 17 (portfolio)', st: 'OK' },
  { at: 560, t: '0.561', msg: 'Applying EF migrations · 9 applied, 0 pending', st: 'OK' },
  { at: 790, t: '0.788', msg: 'Keycloak OIDC discovery · realm authority reached', st: 'OK' },
  { at: 1010, t: '1.006', msg: 'Warming site renderer · index, sitemap, robots', st: 'OK' },
  { at: 1240, t: '1.242', msg: 'Compiling Portfolio', st: 'SUCCESS' },
];

const TOTAL_MS = 1500;

export default function BootSequence({ onDone }) {
  const [shown, setShown] = useState(0);
  const [flash, setFlash] = useState(false);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      try { sessionStorage.setItem(BOOT_FLAG, '1'); } catch { /* private mode */ }
      setFlash(true);
      window.setTimeout(() => onDoneRef.current?.(), reduced ? 0 : 260);
    };

    if (reduced) {
      setShown(LINES.length);
      const t = window.setTimeout(finish, 150);
      return () => window.clearTimeout(t);
    }

    const timers = LINES.map((line, i) =>
      window.setTimeout(() => setShown(i + 1), line.at),
    );
    timers.push(window.setTimeout(finish, TOTAL_MS));

    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  return (
    <>
      <div className="bp-boot" role="status" aria-live="polite" aria-label="Starting">
        <div className="bp-boot-inner">
          <div className="bp-boot-head">portfolio.host — startup</div>

          {LINES.slice(0, shown).map((line) => (
            <div className="bp-boot-row" key={line.t}>
              <span className="bp-boot-t">[{line.t}s]</span>
              <span className="bp-boot-msg">{line.msg}</span>
              <span className={line.st === 'SUCCESS' ? 'bp-boot-st bp-boot-st-final' : 'bp-boot-st'}>
                {line.st}
              </span>
            </div>
          ))}

          {shown < LINES.length && (
            <div className="bp-boot-row">
              <span className="bp-boot-caret" aria-hidden="true" />
            </div>
          )}

          <button
            type="button"
            className="bp-boot-skip"
            onClick={() => {
              if (doneRef.current) return;
              doneRef.current = true;
              try { sessionStorage.setItem(BOOT_FLAG, '1'); } catch { /* private mode */ }
              onDoneRef.current?.();
            }}
          >
            Press any key to skip
          </button>
        </div>
      </div>
      {flash && <div className="bp-boot-flash" aria-hidden="true" />}
    </>
  );
}
