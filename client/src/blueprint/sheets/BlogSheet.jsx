import { useEffect } from 'react';
import { usePublicBlog, usePublicBlogPost } from '../../hooks/usePublicData';
import { RichDoc } from '../../utils/RichDoc';

/**
 * Notes. The list is a ruled log; opening one loads the note's body from the
 * API and renders it over the sheet, Escape to go back.
 */
export default function BlogSheet({ lang, deepLink, onGo }) {
  const tr = lang === 'tr';
  const { data, isLoading, isError } = usePublicBlog(lang);
  const posts = data ?? [];

  // The open note is the URL, not local state: /blog/<slug> has to open that
  // note, and opening one has to produce a link worth sharing.
  const slug = deepLink;
  const open = (next) => onGo('blog', next ?? undefined);

  useEffect(() => {
    if (!slug) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onGo('blog'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slug, onGo]);

  return (
    <>
      <div className="bp-eyebrow">
        {tr ? 'Yazılar' : 'Writing'}
        {posts.length > 0 && <span>{posts.length} {tr ? 'not' : 'notes'}</span>}
      </div>
      <h2 className="bp-h">{tr ? 'Notlar' : 'Notes'}</h2>

      {isLoading && <p className="bp-loading">{tr ? 'Notlar okunuyor…' : 'Reading notes…'}</p>}
      {isError && <p className="bp-empty">{tr ? 'Notlar okunamadı.' : 'Notes could not be read.'}</p>}
      {!isLoading && !isError && posts.length === 0 && (
        <p className="bp-empty">{tr ? 'Henüz yayımlanmış not yok.' : 'Nothing published yet.'}</p>
      )}

      <div className="bp-posts">
        {posts.map((post) => (
          <button type="button" className="bp-post" key={post.id} onClick={() => open(post.slug)}>
            <span className="bp-post-top">
              <span className="bp-post-date">{post.date}</span>
              <span className="bp-post-cat">{post.category}</span>
              {post.readTime > 0 && (
                <span className="bp-post-read">{post.readTime} {tr ? 'dk' : 'min'}</span>
              )}
            </span>
            <h3 className="bp-post-title">{post.title}</h3>
            <p className="bp-post-ex">{post.excerpt}</p>
          </button>
        ))}
      </div>

      {slug && <PostDetail slug={slug} lang={lang} onClose={() => open(null)} />}
    </>
  );
}

function PostDetail({ slug, lang, onClose }) {
  const tr = lang === 'tr';
  const { data: post, isLoading, isError } = usePublicBlogPost(slug, lang);

  return (
    <aside className="bp-detail" aria-label={post?.title ?? slug}>
      <div className="bp-detail-top">
        <span className="bp-detail-no">{post?.category ?? '—'}</span>
        {post?.date && <span className="bp-detail-no">{post.date}</span>}
        <button type="button" className="bp-x" onClick={onClose}>
          {tr ? 'Kapat' : 'Close'}
        </button>
      </div>

      {isLoading && <p className="bp-loading">{tr ? 'Yükleniyor…' : 'Loading…'}</p>}
      {isError && <p className="bp-empty">{tr ? 'Bu not açılamadı.' : 'This note could not be opened.'}</p>}

      {post && (
        <>
          <h3 className="bp-h">{post.title}</h3>
          {post.excerpt && <p className="bp-lede">{post.excerpt}</p>}

          <RichDoc value={post.content} className="bp-doc bp-doc-note" />

          {post.tags?.length > 0 && (
            <div className="bp-chips">
              {post.tags.map((tag) => <span key={tag} className="bp-chip">{tag}</span>)}
            </div>
          )}
        </>
      )}
    </aside>
  );
}
