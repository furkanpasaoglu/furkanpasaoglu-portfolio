import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiX, FiClock, FiTag, FiArrowRight, FiSearch } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import './BlogAllPosts.css';

const allCategories = ['all', '.NET', 'AI / ML', 'DevOps'];

export default function BlogAllPosts({ posts, onClose, onSelectPost }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useLang();

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(panelRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });

    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const cards = panelRef.current?.querySelectorAll('.bap-card');
    if (!cards) return;
    gsap.fromTo(cards, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power3.out' });
  }, [activeCategory, searchQuery]);

  const handleClose = () => {
    gsap.to(panelRef.current, { y: 40, opacity: 0, duration: 0.3, ease: 'power3.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.35, onComplete: onClose });
  };

  return (
    <div className="bap-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}>
      <div className="bap-panel" ref={panelRef}>
        {/* Header */}
        <div className="bap-header">
          <div className="bap-header-left">
            <span className="section-tag" style={{ marginBottom: 0 }}>{t.blog.tag}</span>
            <h2 className="bap-title">{t.blog.allPosts}</h2>
          </div>
          <button className="bap-close" onClick={handleClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Controls: search + filter */}
        <div className="bap-controls">
          <div className="bap-search-wrap">
            <FiSearch className="bap-search-icon" />
            <input
              type="text"
              className="bap-search"
              placeholder={lang === 'tr' ? 'Yazılarda ara...' : 'Search articles...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bap-filter-bar">
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? t.blog.categories.all : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        <div className="bap-scroll">
          {filtered.length === 0 ? (
            <div className="bap-empty">
              <span>{lang === 'tr' ? 'Sonuç bulunamadı.' : 'No results found.'}</span>
            </div>
          ) : (
            <div className="bap-grid">
              {filtered.map((post) => (
                <article
                  key={post.id}
                  className="bap-card"
                  style={{ '--post-color': post.color }}
                  onClick={() => { onSelectPost(post); handleClose(); }}
                >
                  <div className="bap-card-accent" />
                  <div className="bap-card-body">
                    <div className="blog-card-top">
                      <span className="blog-category" style={{ color: post.color, borderColor: `${post.color}40`, background: `${post.color}12` }}>
                        <FiTag /> {post.category}
                      </span>
                      <span className="blog-read-time">
                        <FiClock /> {post.readTime} {t.blog.minRead}
                      </span>
                    </div>
                    <h3 className="bap-post-title">{post.title}</h3>
                    <p className="bap-excerpt">{post.excerpt}</p>
                    <div className="bap-card-footer">
                      <span className="blog-date">{post.date}</span>
                      <span className="blog-read-more" style={{ color: post.color }}>
                        {t.blog.readMore} <FiArrowRight />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
