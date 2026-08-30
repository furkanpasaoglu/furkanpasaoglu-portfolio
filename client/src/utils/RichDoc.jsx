import { safeUrl } from './safeUrl';
import { isEmptyDoc, toDoc } from './richDocModel';

/**
 * Renders a stored rich document into React elements.
 *
 * Nothing here is ever handed to `dangerouslySetInnerHTML` — the document is
 * data, and only the node and mark types listed below become elements.
 * Anything else is dropped rather than trusted, so a future editor upgrade
 * cannot silently introduce a new markup sink. See richDoc.js for the model.
 */

const MARKS = {
  bold: (child, key) => <strong key={key}>{child}</strong>,
  italic: (child, key) => <em key={key}>{child}</em>,
  code: (child, key) => <code className="rt-code" key={key}>{child}</code>,
};

function renderText(node, key) {
  let out = node.text ?? '';

  const link = (node.marks ?? []).find((m) => m.type === 'link');
  const others = (node.marks ?? []).filter((m) => m.type !== 'link');

  others.forEach((mark, i) => {
    const wrap = MARKS[mark.type];
    if (wrap) out = wrap(out, `${key}-m${i}`);
  });

  if (link) {
    const href = safeUrl(link.attrs?.href);
    // An unsafe target degrades to plain text instead of a live link.
    if (href) {
      return (
        <a className="rt-link" href={href} target="_blank" rel="noopener noreferrer" key={key}>
          {out}
        </a>
      );
    }
  }

  return <span key={key}>{out}</span>;
}

function renderNode(node, key) {
  if (!node) return null;

  const kids = (node.content ?? []).map((child, i) => renderNode(child, `${key}-${i}`));

  switch (node.type) {
    case 'text': return renderText(node, key);
    case 'paragraph': return <p className="rt-p" key={key}>{kids}</p>;
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 2), 4);
      const Tag = `h${level}`;
      return <Tag className="rt-h" key={key}>{kids}</Tag>;
    }
    case 'bulletList': return <ul className="rt-ul" key={key}>{kids}</ul>;
    case 'orderedList': return <ol className="rt-ol" key={key}>{kids}</ol>;
    case 'listItem': return <li className="rt-li" key={key}>{kids}</li>;
    case 'blockquote': return <blockquote className="rt-quote" key={key}>{kids}</blockquote>;
    case 'codeBlock': return <pre className="rt-pre" key={key}><code>{node.content?.[0]?.text ?? ''}</code></pre>;
    case 'hardBreak': return <br key={key} />;
    case 'horizontalRule': return <hr className="rt-hr" key={key} />;
    case 'doc': return kids;
    default: return null; // unknown node types are dropped, never trusted
  }
}

/** Render a stored rich document. */
export function RichDoc({ value, className }) {
  const doc = toDoc(value);
  if (isEmptyDoc(doc)) return null;
  return <div className={className}>{renderNode(doc, 'd')}</div>;
}
