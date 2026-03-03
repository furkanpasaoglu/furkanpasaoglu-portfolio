import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiClock, FiArrowRight, FiTag } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import BlogPostPanel from './BlogPostPanel';
import BlogAllPosts from './BlogAllPosts';
import './Blog.css';

gsap.registerPlugin(ScrollTrigger);

const postsData = {
  tr: [
    {
      id: 1,
      title: 'Clean Architecture: .NET Projesini Sıfırdan Yapılandırmak',
      excerpt:
        'N-Tier mimariden Clean Architecture\'a geçiş sürecinde karşılaştığım zorluklar, aldığım kararlar ve öğrendiklerim. Domain, Application, Infrastructure ve Presentation katmanlarını nasıl ayırdım?',
      date: '15 Şubat 2026',
      readTime: 12,
      category: '.NET',
      tags: ['.NET', 'Clean Architecture', 'SOLID'],
      color: '#7c6fff',
      featured: true,
    },
    {
      id: 2,
      title: 'Hangfire ile Background Job Yönetimi ve Zamanlanmış Görevler',
      excerpt:
        '.NET projelerinde tekrarlayan görevleri, sıralı işleri ve zamanlanmış süreçleri yönetmek için Hangfire nasıl kullanılır? Kurulum, dashboard ve production deneyimlerimi aktarıyorum.',
      date: '2 Ocak 2026',
      readTime: 13,
      category: '.NET',
      tags: ['Hangfire', 'Background Jobs', '.NET'],
      color: '#00d4ff',
      featured: true,
    },
    {
      id: 3,
      title: 'C# ile Semantic Search: Semantic Kernel ve Vector DB',
      excerpt:
        'OpenAI embedding\'leri, Semantic Kernel ve Qdrant kullanarak .NET uygulamasına nasıl anlamlı arama eklediğimi adım adım anlatan rehber.',
      date: '20 Aralık 2025',
      readTime: 18,
      category: 'AI / ML',
      tags: ['Semantic Kernel', 'OpenAI', 'Vector DB'],
      color: '#f59e0b',
      featured: true,
    },
    {
      id: 4,
      title: 'CQRS + MediatR: Komut ve Sorgu Ayrımını Anlamak',
      excerpt:
        'CQRS pattern\'ini MediatR kütüphanesiyle nasıl pratik hale getirirsiniz? Teorik bilgiyi gerçek projede uygulayarak edindiğim deneyimler.',
      date: '5 Kasım 2025',
      readTime: 10,
      category: '.NET',
      tags: ['CQRS', 'MediatR', 'DDD'],
      color: '#10b981',
      featured: false,
    },
    {
      id: 5,
      title: '.NET Uygulamalarında Health Checks, Logging ve Monitoring',
      excerpt:
        'Production\'da ne olduğunu bilmek, sorun çıkmadan önce müdahale etmekten geçer. ASP.NET Core Health Checks, Serilog yapılandırması ve uygulama izleme pratiklerini paylaşıyorum.',
      date: '14 Ekim 2025',
      readTime: 14,
      category: 'DevOps',
      tags: ['Health Checks', 'Serilog', 'Monitoring'],
      color: '#0ea5e9',
      featured: false,
    },
    {
      id: 6,
      title: 'Entity Framework Core Performans Tuzakları ve Çözümleri',
      excerpt:
        'N+1 sorunu, eager loading kötüye kullanımı ve yavaş sorgular. EF Core\'da farkında olmadan yaptığımız hatalar ve bunları nasıl düzeltiriz.',
      date: '1 Eylül 2025',
      readTime: 9,
      category: '.NET',
      tags: ['EF Core', 'Performance', 'PostgreSQL'],
      color: '#a78bfa',
      featured: false,
    },
  ],
  en: [
    {
      id: 1,
      title: 'Clean Architecture: Structuring a .NET Project from Scratch',
      excerpt:
        'The challenges, decisions, and lessons I encountered moving from N-Tier to Clean Architecture. How I separated Domain, Application, Infrastructure, and Presentation layers.',
      date: 'February 15, 2026',
      readTime: 12,
      category: '.NET',
      tags: ['.NET', 'Clean Architecture', 'SOLID'],
      color: '#7c6fff',
      featured: true,
    },
    {
      id: 2,
      title: 'Background Job Management with Hangfire in .NET',
      excerpt:
        'How to use Hangfire to manage recurring tasks, queued jobs, and scheduled processes in .NET projects? Setup, dashboard configuration, and lessons from production.',
      date: 'January 2, 2026',
      readTime: 13,
      category: '.NET',
      tags: ['Hangfire', 'Background Jobs', '.NET'],
      color: '#00d4ff',
      featured: true,
    },
    {
      id: 3,
      title: 'Semantic Search with C#: Semantic Kernel and Vector DB',
      excerpt:
        'A step-by-step guide on how I added meaningful search to a .NET application using OpenAI embeddings, Semantic Kernel, and Qdrant.',
      date: 'December 20, 2025',
      readTime: 18,
      category: 'AI / ML',
      tags: ['Semantic Kernel', 'OpenAI', 'Vector DB'],
      color: '#f59e0b',
      featured: true,
    },
    {
      id: 4,
      title: 'CQRS + MediatR: Understanding Command and Query Separation',
      excerpt:
        'How do you make the CQRS pattern practical with the MediatR library? My experience applying theoretical knowledge to a real project.',
      date: 'November 5, 2025',
      readTime: 10,
      category: '.NET',
      tags: ['CQRS', 'MediatR', 'DDD'],
      color: '#10b981',
      featured: false,
    },
    {
      id: 5,
      title: 'Health Checks, Logging & Monitoring in .NET Applications',
      excerpt:
        'Knowing what happens in production is the key to acting before things break. I share ASP.NET Core Health Checks setup, Serilog configuration, and application monitoring practices.',
      date: 'October 14, 2025',
      readTime: 14,
      category: 'DevOps',
      tags: ['Health Checks', 'Serilog', 'Monitoring'],
      color: '#0ea5e9',
      featured: false,
    },
    {
      id: 6,
      title: 'Entity Framework Core Performance Pitfalls and Solutions',
      excerpt:
        'N+1 problem, misuse of eager loading, and slow queries. Mistakes we unknowingly make in EF Core and how to fix them.',
      date: 'September 1, 2025',
      readTime: 9,
      category: '.NET',
      tags: ['EF Core', 'Performance', 'PostgreSQL'],
      color: '#a78bfa',
      featured: false,
    },
  ],
};

const allCategories = ['all', '.NET', 'AI / ML', 'DevOps'];

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
        <div className="blog-header">
          <span className="section-tag">{t.blog.tag}</span>
          <h2 className="section-title">{t.blog.title}</h2>
          <p className="section-desc">{t.blog.desc}</p>
        </div>

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
