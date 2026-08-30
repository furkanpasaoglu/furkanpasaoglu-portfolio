/** Small shared cell renderers for the admin tables. */

export function Bilingual({ en, tr }) {
  return (
    <span className="fp-two">
      <span className="fp-two-a">{en || '—'}</span>
      <span className="fp-two-b">{tr || '—'}</span>
    </span>
  );
}

export function Swatch({ color }) {
  return <span className="fp-swatch" style={{ background: color }} aria-hidden="true" />;
}

export function When({ value }) {
  if (!value) return <span className="fp-cellmuted">—</span>;
  return <span className="fp-cellmuted">{new Date(value).toLocaleDateString('tr-TR')}</span>;
}
