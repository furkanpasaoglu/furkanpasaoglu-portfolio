import { useMemo, useState } from 'react';
import { FiArrowRight, FiClock, FiSearch } from 'react-icons/fi';
import { useLang } from '../../hooks/useLang';
import { usePublicBlog, usePublicBlogPost } from '../../hooks/usePublicData';
import { useSelectableDetail } from '../../hooks/useSelectableDetail';
import Reveal from '../ui/Reveal';
import SectionHeader from '../ui/SectionHeader';
import SlidePanel from '../ui/SlidePanel';
import './Blog.css';

function BlogCover({ post, size = 'md' }) {
  return (
    <div className={`blog-cover blog-cover-${size}`}>
      <div className="blog-cover-blob" />
      <div className="blog-cover-dots" />
      <div className="blog-cover-lines" />
      <span className="blog-cover-bg-text">{post.category}</span>
      <span className="blog-cover-cat">{post.category}</span>
    </div>
  );
}

function BlogHero({ post, onOpen, t, featuredLabel }) {
  return (
    <article
      className="blog-hero glass"
      onClick={onOpen}
      style={{ '--post-color': post.color }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      <BlogCover post={post} size="lg" />
      <div className="blog-hero-body">
        <div className="blog-hero-badge">
          <span className="blog-hero-badge-dot" />
          {featuredLabel}
        </div>
        <div className="blog-card-meta">
          <span>{post.date}</span>
          <span className="blog-card-meta-sep">·</span>
          <span className="blog-card-meta-read">
            <FiClock /> {post.readTime} {t.blog.minRead}
          </span>
        </div>
        <h3 className="blog-hero-title">{post.title}</h3>
        <p className="blog-hero-excerpt">{post.excerpt}</p>
        <div className="blog-card-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="blog-card-tag">#{tag}</span>
          ))}
        </div>
        <div className="blog-card-foot">
          {t.blog.readMore} <FiArrowRight />
        </div>
      </div>
    </article>
  );
}

function BlogPost({ post, onOpen, t }) {
  return (
    <article
      className="blog-card glass"
      onClick={onOpen}
      style={{ '--post-color': post.color }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      <BlogCover post={post} size="md" />
      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span>{post.date}</span>
          <span className="blog-card-meta-sep">·</span>
          <span className="blog-card-meta-read">
            <FiClock /> {post.readTime} {t.blog.minRead}
          </span>
        </div>
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <div className="blog-card-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="blog-card-tag">#{tag}</span>
          ))}
        </div>
        <div className="blog-card-foot">
          {t.blog.readMore} <FiArrowRight />
        </div>
      </div>
    </article>
  );
}

function BlogReader({ post, content, t }) {
  if (!post) return null;
  return (
    <div className="blog-reader">
      <div className="blog-reader-head" style={{ '--post-color': post.color }}>
        <div className="blog-reader-meta">
          <span className="blog-reader-cat">{post.category}</span>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime} {t.blog.minRead}</span>
        </div>
        <h1 className="blog-reader-title">{post.title}</h1>
        <p className="blog-reader-excerpt">{post.excerpt}</p>
        <div className="blog-reader-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="blog-reader-tag">#{tag}</span>
          ))}
        </div>
      </div>

      <div className="blog-reader-body">
        {(content || []).map((block, i) => {
          const key = `${block.type}-${i}`;
          if (block.type === 'heading') return <h2 key={key}>{block.text}</h2>;
          if (block.type === 'paragraph') return <p key={key}>{block.text}</p>;
          if (block.type === 'code') return (
            <pre key={key} className="blog-code">
              <code>{block.text}</code>
            </pre>
          );
          if (block.type === 'note') return (
            <aside key={key} className="blog-note">
              <strong>Not:</strong> {block.text}
            </aside>
          );
          return null;
        })}
      </div>
    </div>
  );
}

export default function Blog() {
  const { t, lang } = useLang();
  const { selected, select, panelProps } = useSelectableDetail();
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const { data: posts = [] } = usePublicBlog(lang);
  const allCategories = useMemo(
    () => ['all', ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts],
  );
  const featured = posts.filter((p) => p.isFeatured);
  const heroPost = featured[0];
  const secondary = featured.slice(1);
  const featuredLabel = lang === 'tr' ? 'Öne Çıkan' : 'Featured';

  const filtered = posts.filter((p) => {
    const matchesCat = category === 'all' || p.category === category;
    const q = query.toLowerCase();
    const matchesQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((tg) => tg.toLowerCase().includes(q));
    return matchesCat && matchesQ;
  });

  // Fetch full content when a post is selected
  const { data: selectedDetail } = usePublicBlogPost(selected?.slug, lang);
  const content = selectedDetail?.content ?? null;

  return (
    <section id="blog" className="section blog">
      <div className="container">
        <SectionHeader variant="accent" tag={t.blog.tag} title={t.blog.title} desc={t.blog.desc} />

        {heroPost && (
          <Reveal>
            <BlogHero
              post={heroPost}
              t={t}
              featuredLabel={featuredLabel}
              onOpen={() => select(heroPost)}
            />
          </Reveal>
        )}

        {secondary.length > 0 && (
          <div className="blog-grid">
            {secondary.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <BlogPost post={p} t={t} onOpen={() => select(p)} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="blog-outro" delay={100}>
          <button type="button" onClick={() => setShowAll(true)} className="btn btn-ghost">
            {t.blog.allPosts} <FiArrowRight />
          </button>
        </Reveal>
      </div>

      {/* All posts panel */}
      <SlidePanel open={showAll} onClose={() => setShowAll(false)} ariaLabel="All posts">
        <div className="blog-all">
          <h2 className="blog-all-title">{t.blog.title}</h2>
          <div className="blog-search">
            <FiSearch />
            <input
              type="text"
              placeholder={t.common.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="blog-cats">
            {allCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`blog-cat ${category === c ? 'is-active' : ''}`}
              >
                {c === 'all' ? t.blog.categories.all : c}
              </button>
            ))}
          </div>

          <div className="blog-all-list">
            {filtered.length === 0 ? (
              <p className="blog-empty">{t.common.noResults}</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="blog-all-item"
                  onClick={() => {
                    setShowAll(false);
                    select(p);
                  }}
                  style={{ '--post-color': p.color }}
                >
                  <div className="blog-all-item-head">
                    <span className="blog-all-item-cat">{p.category}</span>
                    <span className="blog-all-item-date">{p.date}</span>
                  </div>
                  <h4 className="blog-all-item-title">{p.title}</h4>
                  <p className="blog-all-item-excerpt">{p.excerpt}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </SlidePanel>

      {/* Single post reader */}
      <SlidePanel {...panelProps} ariaLabel="Article">
        <BlogReader post={selected} content={content} t={t} />
      </SlidePanel>
    </section>
  );
}
