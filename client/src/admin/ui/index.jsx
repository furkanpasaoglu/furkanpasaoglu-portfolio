import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastCtx } from './hooks';

/**
 * The admin's own primitives. Everything Mantine used to provide, in the
 * blueprint's language and with no framework underneath: buttons, fields,
 * switches, tables, toasts and a confirm dialog.
 *
 * Deliberately plain — these are thin wrappers over real form elements, so
 * browser behaviour (validation, autofill, keyboard) keeps working.
 */

/* ── Buttons ───────────────────────────────────────────────────────── */
export function Button({ variant = 'default', busy = false, children, className = '', ...rest }) {
  const kind = variant === 'default' ? '' : ` fp-btn-${variant}`;
  return (
    <button
      type="button"
      className={`fp-btn${kind}${className ? ` ${className}` : ''}`}
      disabled={busy || rest.disabled}
      {...rest}
    >
      {busy ? '…' : children}
    </button>
  );
}

/* ── Fields ────────────────────────────────────────────────────────── */
export function Field({ label, required, hint, error, htmlFor, children }) {
  return (
    <div className="fp-field">
      {label && (
        <label className={`fp-label${required ? ' fp-label-req' : ''}`} htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="fp-hint">{hint}</p>}
      {error && <p className="fp-error">{error}</p>}
    </div>
  );
}

export function Input({ mono, className = '', ...rest }) {
  return <input className={`fp-input${mono ? ' fp-mono' : ''}${className ? ` ${className}` : ''}`} {...rest} />;
}

export function Textarea({ mono, className = '', ...rest }) {
  return <textarea className={`fp-textarea${mono ? ' fp-mono' : ''}${className ? ` ${className}` : ''}`} {...rest} />;
}

export function Select({ options = [], className = '', ...rest }) {
  return (
    <select className={`fp-select${className ? ` ${className}` : ''}`} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Switch({ label, checked, onChange, ...rest }) {
  return (
    <label className="fp-switch">
      <input type="checkbox" checked={!!checked} onChange={onChange} {...rest} />
      <span className="fp-switch-box" aria-hidden="true" />
      {label}
    </label>
  );
}

/**
 * Tag entry. Enter commits, Backspace on an empty box removes the last one —
 * the behaviour people already expect from a tag field.
 */
export function TagsInput({ value = [], onChange, placeholder = 'Yaz ve Enter' }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };

  return (
    <div className="fp-tags">
      {value.map((tag) => (
        <span className="fp-tag" key={tag}>
          {tag}
          <button type="button" className="fp-tag-x" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`${tag} kaldır`}>✕</button>
        </span>
      ))}
      <input
        className="fp-tags-input"
        value={draft}
        placeholder={value.length === 0 ? placeholder : ''}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
          if (e.key === 'Backspace' && draft === '' && value.length) onChange(value.slice(0, -1));
        }}
      />
    </div>
  );
}

/* ── State pill ────────────────────────────────────────────────────── */
export function Pill({ on, children }) {
  return <span className={on ? 'fp-pill fp-pill-on' : 'fp-pill'}>{children}</span>;
}

/* ── Toasts ────────────────────────────────────────────────────────── */
let toastSeq = 0;

export function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { window.clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const push = useCallback((message, kind = 'ok') => {
    const id = (toastSeq += 1);
    setToasts((prev) => [...prev, { id, message, kind }]);
    timers.current.set(id, window.setTimeout(() => dismiss(id), 4200));
  }, [dismiss]);

  const timersRef = timers;
  useEffect(() => () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current.clear();
  }, [timersRef]);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fp-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className={`fp-toast fp-toast-${t.kind}`} key={t.id}>
            <span>{t.message}</span>
            <button type="button" className="fp-toast-x" onClick={() => dismiss(t.id)} aria-label="Kapat">✕</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ── Confirm ───────────────────────────────────────────────────────── */
/**
 * A real dialog instead of window.confirm — the native one is blocked in
 * some embedded contexts and cannot say what it is about to delete.
 */
export function Confirm({ open, title, body, confirmLabel = 'Sil', danger = true, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fp-scrim" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="fp-modal">
        <h2 className="fp-modal-title">{title}</h2>
        <p className="fp-modal-body">{body}</p>
        <div className="fp-modal-btns">
          <Button onClick={onCancel}>Vazgeç</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Page header ───────────────────────────────────────────────────── */
export function PageHead({ eyebrow, title, children }) {
  return (
    <>
      {eyebrow && <div className="fp-eyebrow">{eyebrow}</div>}
      <div className="fp-head">
        <h1 className="fp-h">{title}</h1>
        <span className="fp-head-spacer" />
        {children && <div className="fp-btns">{children}</div>}
      </div>
    </>
  );
}

/* Re-export so pages import every primitive from one place. */
export { default as RichEditor } from './RichEditor';
