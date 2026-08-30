import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveSheetLoose, sheetLabel, sheetNo } from './sheetRegistry';
import { usePublicTerminalCommands } from '../hooks/usePublicData';
import { terminalText } from './terminalText';
import { safeUrl } from '../utils/safeUrl';

/**
 * Navigation by command. `cd` and `ls` do the real work; everything else is
 * a small, honest utility. Replies are written in the interface's voice —
 * they say what happened, they don't perform.
 *
 * The commands below are the ones that *do* something, so they live here.
 * Anything that only prints a reply is content, written in the admin panel
 * and loaded at runtime — see usePublicTerminalCommands.
 */

let seq = 0;
const line = (kind, text) => ({ id: (seq += 1), kind, text });

export default function Terminal({ open, onOpen, onClose, sheet, sheets, lang, t, onGo, onLang, personal, onReboot }) {
  const say = useCallback((key) => terminalText(t, lang, key), [t, lang]);
  const { data: custom } = usePublicTerminalCommands(lang);

  const [log, setLog] = useState(() => [line('out', terminalText(null, lang, 'greeting'))]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);
  const [cursor, setCursor] = useState(-1);

  const inputRef = useRef(null);
  const logRef = useRef(null);

  const push = useCallback((...lines) => setLog((prev) => [...prev, ...lines]), []);

  // The greeting is already on screen by the time the stored texts arrive, so
  // it is rewritten in place rather than pushed again.
  const greeting = say('greeting');
  useEffect(() => {
    setLog((prev) => (prev[0]?.kind === 'out'
      ? [{ ...prev[0], text: greeting }, ...prev.slice(1)]
      : prev));
  }, [greeting]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  // `/` opens and focuses the terminal from anywhere on the page.
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target;
      const typing = el instanceof HTMLElement
        && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) return;
      if (e.key === '/') {
        e.preventDefault();
        onOpen();
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpen]);

  const run = useCallback((raw) => {
    const input = raw.trim();
    if (!input) return;

    push(line('in', `> ${input}`));
    setHistory((prev) => [input, ...prev].slice(0, 40));
    setCursor(-1);

    const [cmd, ...rest] = input.split(/\s+/);
    const arg = rest.join(' ').toLowerCase();
    const tr = lang === 'tr';

    switch (cmd.toLowerCase()) {
      case 'help':
        push(
          line('out', say('helpTitle')),
          line('out', '  ls                 ' + (tr ? 'paftaları listele' : 'list sheets')),
          line('out', '  cd <pafta>         ' + (tr ? 'paftayı aç' : 'open a sheet')),
          line('out', '  lang tr|en         ' + (tr ? 'dili değiştir' : 'switch language')),
          line('out', '  open github|linkedin|cv'),
          line('out', '  dotnet --info      ' + (tr ? 'çalışma ortamı' : 'runtime information')),
          line('out', '  reboot             ' + (tr ? 'açılışı tekrar oynat' : 'replay the boot sequence')),
          line('out', '  clear'),
        );
        // Written ones come after the built-ins: they are additions, and the
        // list should still read the same way tomorrow as it does today.
        (custom ?? []).forEach((c) => push(
          line('out', `  ${c.name.padEnd(18)} ${c.summary}`),
        ));
        break;

      case 'ls':
        sheets.forEach((s) => push(
          line('out', `  ${sheetNo(sheets, s.key)}  ${s.key.padEnd(12)} ${sheetLabel(s.key, lang)}`),
        ));
        break;

      case 'cd': {
        if (!arg || arg === '~' || arg === '..' || arg === '/') {
          onGo('index');
          break;
        }
        const match = resolveSheetLoose(sheets, arg);
        if (match) {
          onGo(match);
        } else {
          push(line('err', `cd: ${arg}: ${tr ? 'böyle bir pafta yok' : 'no such sheet'}`));
          push(line('out', tr ? '`ls` ile listeye bakabilirsin.' : 'Run `ls` to see what exists.'));
        }
        break;
      }

      case 'lang':
        if (arg === 'tr' || arg === 'en') {
          onLang(arg);
          push(line('ok', arg === 'tr' ? 'Dil: Türkçe' : 'Language: English'));
        } else {
          push(line('err', 'lang: ' + (tr ? 'tr veya en' : 'expected tr or en')));
        }
        break;

      case 'open': {
        const targets = {
          github: personal?.github,
          linkedin: personal?.linkedin,
          cv: personal?.cvUrl,
        };
        const url = safeUrl(targets[arg]);
        if (!url) {
          push(line('err', `open: ${arg || '—'}: ${tr ? 'bağlantı tanımlı değil' : 'no link configured'}`));
          break;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
        push(line('ok', `${tr ? 'Yeni sekmede açıldı' : 'Opened in a new tab'} — ${url}`));
        break;
      }

      case 'dotnet':
        if (arg === '--info' || arg === '--version' || arg === '') {
          push(
            line('out', 'Host:'),
            line('out', '  Version:      9.0.0'),
            line('out', '  Architecture: x64'),
            line('out', 'Runtime environment:'),
            line('out', '  OS Name:      debian (container)'),
            line('out', '  Data store:   PostgreSQL 17 · Npgsql, jsonb'),
            line('out', '  Identity:     Keycloak OIDC · code + PKCE, BFF'),
            line('ok', tr ? '  Operatör:     İstanbul, TR' : '  Operator:     Istanbul, TR'),
          );
        } else {
          push(line('err', `dotnet: ${tr ? 'bilinmeyen seçenek' : 'unknown option'} '${arg}'`));
        }
        break;

      case 'reboot':
        onReboot();
        break;

      case 'clear':
        setLog([]);
        break;

      default: {
        // A written command prints its reply, one log line per line of text.
        const hit = (custom ?? []).find((c) => c.name === cmd.toLowerCase());
        if (hit) {
          String(hit.body).split('\n').forEach((l) => push(line('out', l)));
          break;
        }
        push(line('err', `${cmd}: ${say('notFound')}`));
        push(line('out', say('notFoundHint')));
      }
    }
  }, [custom, lang, onGo, onLang, onReboot, personal, push, say, sheets]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(value);
      setValue('');
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const parts = value.split(/\s+/);
      if (parts[0] === 'cd' && parts.length === 2 && parts[1]) {
        const hit = resolveSheetLoose(sheets, parts[1]);
        if (hit) setValue(`cd ${hit}`);
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) { setCursor(next); setValue(history[next]); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next >= 0 ? history[next] : '');
    }
  };

  if (!open) {
    return (
      <button type="button" className="bp-term-launch" onClick={onOpen}>
        <span className="bp-term-dot" aria-hidden="true" />
        {lang === 'tr' ? 'Terminal' : 'Terminal'}
      </button>
    );
  }

  return (
    <section className="bp-term" aria-label="Terminal">
      <div className="bp-term-bar">
        <span className="bp-term-dot" aria-hidden="true" />
        <span className="bp-term-name">portfolio ~ /{sheet}</span>
        <span className="bp-term-bar-spacer" />
        <button
          type="button"
          className="bp-term-close"
          onClick={onClose}
          aria-label={lang === 'tr' ? 'Terminali kapat' : 'Close terminal'}
        >
          ✕
        </button>
      </div>

      <div className="bp-term-log" ref={logRef} role="log" aria-live="polite">
        {log.map((l) => (
          // A blank line is deliberate spacing in a written reply, so it has
          // to keep its height instead of collapsing.
          <div key={l.id} className={`bp-term-line bp-term-${l.kind}`}>{l.text || ' '}</div>
        ))}
      </div>

      <form
        className="bp-term-form"
        onSubmit={(e) => { e.preventDefault(); run(value); setValue(''); }}
      >
        <span className="bp-term-ps1" aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          className="bp-term-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={lang === 'tr' ? 'cd projects' : 'cd projects'}
          aria-label={lang === 'tr' ? 'Komut' : 'Command'}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </form>
    </section>
  );
}
