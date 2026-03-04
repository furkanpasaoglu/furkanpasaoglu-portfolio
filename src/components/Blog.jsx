import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiClock, FiArrowRight, FiTag } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import BlogPostPanel from './BlogPostPanel';
import BlogAllPosts from './BlogAllPosts';
import { postsData, allCategories } from '../data/blogData';
import SectionHeader from './shared/SectionHeader';
import './Blog.css';

export default function Blog() {
  const sectionRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const { t, lang } = useLang();

  const posts = postsData[lang] || postsData.tr;
  const filtered = activeCategory === 'all' ? posts : posts.filter((p) => p.category === activeCategory);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current.querySelector('.blog-header');
      gsap.fromTo(header, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 82%', toggleActions: 'play none none reverse' },
      });

      gsap.fromTo('.blog-filter-bar', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.blog-filter-bar', start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Re-animate cards when filter changes
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.blog-card');
    if (!cards || cards.length === 0) return;
    gsap.fromTo(cards,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
    );
  }, [activeCategory, lang]);

  return (
    <>
      {selectedPost && (
        <BlogPostPanel post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
      {showAll && (
        <BlogAllPosts
          posts={posts}
          onClose={() => setShowAll(false)}
          onSelectPost={(post) => setSelectedPost(post)}
        />
      )}
    <section id="blog" className="blog-section" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <SectionHeader
          tag={t.blog.tag}
          title={t.blog.title}
          desc={t.blog.desc}
          className="blog-header"
        />

        {/* Filter Bar */}
        <div className="blog-filter-bar">
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

        {/* Featured Row (top 3) */}
        <div className="blog-featured-row">
          {filtered.filter((p) => p.featured).map((post) => (
            <article
              key={post.id}
              className="blog-card blog-card-featured"
              style={{ '--post-color': post.color }}
            >
              <div className="blog-card-accent" />
              <div className="blog-card-body">
                <div className="blog-card-top">
                  <span className="blog-category" style={{ color: post.color, borderColor: `${post.color}40`, background: `${post.color}12` }}>
                    <FiTag /> {post.category}
                  </span>
                  <span className="blog-read-time">
                    <FiClock /> {post.readTime} {t.blog.minRead}
                  </span>
                </div>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-footer">
                  <span className="blog-date">{post.date}</span>
                  <button className="blog-read-more" style={{ color: post.color }} onClick={() => setSelectedPost(post)}>
                    {t.blog.readMore} <FiArrowRight />
                  </button>
                </div>
                <div className="blog-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="blog-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Regular posts */}
        {filtered.filter((p) => !p.featured).length > 0 && (
          <div className="blog-list-row">
            {filtered.filter((p) => !p.featured).map((post) => (
              <article
                key={post.id}
                className="blog-card blog-card-list"
                style={{ '--post-color': post.color }}
              >
                <div className="blog-card-list-left">
                  <div className="blog-card-top">
                    <span className="blog-category" style={{ color: post.color, borderColor: `${post.color}40`, background: `${post.color}12` }}>
                      <FiTag /> {post.category}
                    </span>
                    <span className="blog-read-time">
                      <FiClock /> {post.readTime} {t.blog.minRead}
                    </span>
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                </div>
                <div className="blog-card-list-right">
                  <span className="blog-date">{post.date}</span>
                  <div className="blog-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                  <button className="blog-read-more" style={{ color: post.color }} onClick={() => setSelectedPost(post)}>
                    {t.blog.readMore} <FiArrowRight />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="blog-cta-row">
          <button className="btn btn-outline" onClick={() => setShowAll(true)}>
            <FiArrowRight /> {t.blog.allPosts}
          </button>
        </div>
      </div>
    </section>
    </>
  );
}
