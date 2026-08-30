
/**
 * Rich document model.
 *
 * The editor writes a structured document (TipTap/ProseMirror JSON) rather
 * than HTML, and the whole security story follows from that: since nothing
 * stored is markup, nothing on the way out has to be sanitised. This file is
 * the model — reading, converting and inspecting documents. RichDoc.jsx turns
 * one into React elements.
 */

const EMPTY_DOC = { type: 'doc', content: [] };

/* ── Reading ───────────────────────────────────────────────────────── */

/**
 * Accepts a doc and every shape the database still holds: a JSON string, a
 * note's block array, or plain text. Always returns a doc.
 */
export function toDoc(value) {
  if (!value) return EMPTY_DOC;

  if (Array.isArray(value)) return fromBlocks(value);

  if (typeof value === 'object') {
    return value.type === 'doc' ? value : EMPTY_DOC;
  }

  if (typeof value !== 'string') return EMPTY_DOC;

  const text = value.trim();
  if (!text) return EMPTY_DOC;

  // A record saved by the newer editor arrives as serialised JSON.
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.type === 'doc') return parsed;
    } catch { /* not a doc — fall through and treat it as prose */ }
  }

  return fromPlainText(text);
}

/** Legacy rows hold plain text; blank lines separate paragraphs. */
function fromPlainText(text) {
  const paragraphs = String(text).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return {
    type: 'doc',
    content: paragraphs.map((p) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p }],
    })),
  };
}

/**
 * Notes used to be an ordered array of typed blocks. Each type has an exact
 * counterpart in the document model, so the conversion is lossless — except
 * for a code block's language tag, which nothing ever rendered.
 *
 * The keys are read in both casings on purpose. Blocks written through the
 * old C# type are stored as `{"Type","Text"}` and now travel to the browser
 * verbatim, because the column is passed through as raw JSON instead of
 * being re-serialised by a record; the seed file uses `{"type","text"}`.
 */
function fromBlocks(blocks) {
  const paragraph = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
  const field = (b, name) => b?.[name] ?? b?.[name[0].toUpperCase() + name.slice(1)];

  const content = blocks
    .filter((b) => field(b, 'text')?.trim())
    .map((b) => {
      const raw = field(b, 'text');
      const text = raw.trim();
      switch (field(b, 'type')) {
        case 'heading':
          return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text }] };
        // Indentation is the content of a code block, so it keeps its raw form.
        case 'code':
          return { type: 'codeBlock', content: [{ type: 'text', text: raw }] };
        // A "note" was a callout — a quote is the same thing in this model.
        case 'note':
          return { type: 'blockquote', content: [paragraph(text)] };
        default:
          return paragraph(text);
      }
    });

  return { type: 'doc', content };
}

/** Appends legacy `highlights` to a doc as a bullet list, once. */
export function withHighlights(doc, highlights) {
  const items = (highlights ?? []).map((h) => String(h).trim()).filter(Boolean);
  if (items.length === 0) return doc;

  return {
    ...doc,
    content: [
      ...(doc.content ?? []),
      {
        type: 'bulletList',
        content: items.map((text) => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
        })),
      },
    ],
  };
}

/** True when the document carries no visible text. */
export function isEmptyDoc(doc) {
  const walk = (node) => {
    if (!node) return false;
    if (node.type === 'text') return Boolean(node.text?.trim());
    return (node.content ?? []).some(walk);
  };
  return !walk(doc);
}

