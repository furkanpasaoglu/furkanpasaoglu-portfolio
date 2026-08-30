import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { safeUrl } from '../../utils/safeUrl';
import { toDoc } from '../../utils/richDocModel';

/**
 * The rich text editor. Writes a structured document, not HTML — see
 * utils/richDocModel.js for why that distinction is the whole security story.
 *
 * The document is only pushed into the editor when it changed somewhere else
 * (the record loaded, the language tab flipped). Every keystroke comes back
 * down as `value`, and re-seeding on those would move the caret to the end of
 * the text on every letter typed, so the editor's own output is recognised by
 * identity and skipped.
 */

const BLOCKS = [
  { key: 'h2', label: 'H2', title: 'Başlık', is: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { key: 'h3', label: 'H3', title: 'Alt başlık', is: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { key: 'ul', label: '• Liste', title: 'Madde listesi', is: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { key: 'ol', label: '1. Liste', title: 'Numaralı liste', is: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { key: 'quote', label: '❝', title: 'Alıntı', is: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
];

const MARKS = [
  { key: 'bold', label: 'B', title: 'Kalın', className: 'fp-mk-b' },
  { key: 'italic', label: 'I', title: 'İtalik', className: 'fp-mk-i' },
  { key: 'code', label: '<>', title: 'Kod' },
];

export default function RichEditor({ value, onChange, placeholder }) {
  // The last document this editor produced. Compared by identity, so a value
  // coming back down unchanged is our own and needs no re-seeding.
  const own = useRef(null);

  const editor = useEditor({
    extensions: [
      // StarterKit ships its own link; ours is configured, so disable that one
      // rather than registering the extension twice.
      StarterKit.configure({ link: false, codeBlock: {} }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        // Belt: the renderer also refuses non-http(s) targets.
        validate: (href) => Boolean(safeUrl(href)),
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: toDoc(value),
    onUpdate: ({ editor: ed }) => {
      const doc = ed.getJSON();
      own.current = doc;
      onChange(doc);
    },
  });

  useEffect(() => {
    if (!editor || value === own.current) return;
    own.current = value;
    editor.commands.setContent(toDoc(value), { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return <div className="fp-rte fp-rte-loading">Editör yükleniyor…</div>;

  const addLink = () => {
    const current = editor.getAttributes('link').href ?? '';
    const input = window.prompt('Bağlantı adresi (boş bırakırsan kaldırılır):', current);
    if (input === null) return;

    if (!input.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const href = safeUrl(input.trim());
    if (!href) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <div className="fp-rte">
      <div className="fp-mk-bar">
        {MARKS.map((m) => (
          <button
            key={m.key}
            type="button"
            title={m.title}
            className={`fp-mk-btn${m.className ? ` ${m.className}` : ''}${editor.isActive(m.key) ? ' fp-mk-on' : ''}`}
            onClick={() => editor.chain().focus().toggleMark(m.key).run()}
          >
            {m.label}
          </button>
        ))}

        <span className="fp-mk-sep" />

        {BLOCKS.map((b) => (
          <button
            key={b.key}
            type="button"
            title={b.title}
            className={`fp-mk-btn${b.is(editor) ? ' fp-mk-on' : ''}`}
            onClick={() => b.run(editor)}
          >
            {b.label}
          </button>
        ))}

        <span className="fp-mk-sep" />

        <button
          type="button"
          title="Bağlantı"
          className={`fp-mk-btn${editor.isActive('link') ? ' fp-mk-on' : ''}`}
          onClick={addLink}
        >
          ⛓
        </button>
        <button
          type="button"
          title="Biçimi temizle"
          className="fp-mk-btn"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          ⌫
        </button>
      </div>

      <EditorContent className="fp-rte-body" editor={editor} data-placeholder={placeholder} />
    </div>
  );
}
