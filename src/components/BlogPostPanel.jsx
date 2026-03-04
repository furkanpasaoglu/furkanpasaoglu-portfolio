import { useRef } from 'react';
import { FiX, FiClock, FiTag, FiArrowLeft, FiGithub } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import { blogContent } from '../data/blogContent';
import { useSlidePanelAnimation } from '../hooks/useSlidePanelAnimation';
import './BlogPostPanel.css';

export default function BlogPostPanel({ post, onClose }) {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const { lang, t } = useLang();

  const content = blogContent[lang]?.[post.id] || [];

  const { handleClose } = useSlidePanelAnimation(panelRef, overlayRef, onClose, null);

  return (
    <div className="bpp-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}>
      <div className="bpp-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label={post.title}>
        {/* Panel Header */}
        <div className="bpp-header">
          <button className="bpp-back" onClick={handleClose}>
            <FiArrowLeft /> {t.common.back}
          </button>
          <button className="bpp-close" onClick={handleClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="bpp-scroll">
          {/* Post Meta */}
          <div className="bpp-meta">
            <span className="bpp-category" style={{ color: post.color, borderColor: `${post.color}40`, background: `${post.color}12` }}>
              <FiTag /> {post.category}
            </span>
            <span className="bpp-read-time">
              <FiClock /> {post.readTime} {t.blog.minRead}
            </span>
            <span className="bpp-date">{post.date}</span>
          </div>

          <h1 className="bpp-title">{post.title}</h1>

          <div className="bpp-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="bpp-tag">{tag}</span>
            ))}
          </div>

          {/* Accent line */}
          <div className="bpp-accent-line" style={{ background: post.color }} />

          {/* Article Content */}
          <article className="bpp-article">
            {content.map((section, i) => {
              if (section.type === 'heading') {
                return <h2 key={i} className="bpp-h2">{section.text}</h2>;
              }
              if (section.type === 'paragraph') {
                return <p key={i} className="bpp-p">{section.text}</p>;
              }
              if (section.type === 'note') {
                return (
                  <div key={i} className="bpp-note" style={{ borderColor: post.color, background: `${post.color}0d` }}>
                    <span className="bpp-note-icon" style={{ color: post.color }}>💡</span>
                    <p>{section.text}</p>
                  </div>
                );
              }
              if (section.type === 'code') {
                return (
                  <div key={i} className="bpp-code-block">
                    <div className="bpp-code-header">
                      <div className="bpp-code-dots">
                        <span /><span /><span />
                      </div>
                      <span className="bpp-code-lang">{section.lang}</span>
                    </div>
                    <pre className="bpp-pre"><code>{section.text}</code></pre>
                  </div>
                );
              }
              return null;
            })}
          </article>

          {/* Footer CTA */}
          <div className="bpp-footer">
            <a
              href="https://github.com/furkanpasaoglu"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ borderColor: post.color, color: post.color }}
            >
              <FiGithub />
              {lang === 'tr' ? "GitHub'da Takip Et" : 'Follow on GitHub'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
