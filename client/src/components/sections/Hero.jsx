import { useEffect, useRef } from 'react';
import { FiArrowDown, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { useLang } from '../../hooks/useLang';
import { usePublicPersonal } from '../../hooks/usePublicData';
import './Hero.css';

export default function Hero() {
  const { t } = useLang();
  const { data: personal } = usePublicPersonal();
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const handleScroll = () => {
      const y = window.scrollY;
      el.style.setProperty('--scroll-y', `${y * 0.15}px`);
      el.style.setProperty('--scroll-fade', Math.max(0, 1 - y / 500));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" className="hero" ref={wrapRef}>
      <div className="hero-stage">
        <div className="hero-aurora">
          <span className="aurora-blob aurora-1" />
          <span className="aurora-blob aurora-2" />
          <span className="aurora-blob aurora-3" />
          <span className="aurora-blob aurora-4" />
        </div>
        <div className="hero-grid" />
        <div className="hero-vignette" />
      </div>

      <div className="hero-content container">
        <div className="hero-inner">
          <span className="hero-greeting">
            <span className="hero-greeting-dot" />
            {t.hero.greeting}
          </span>

          <h1 className="hero-name">
            <span className="hero-name-line">Furkan</span>
            <span className="hero-name-line hero-name-accent">Paşaoğlu</span>
          </h1>

          <h2 className="hero-subtitle">{t.hero.subtitle}</h2>

          <p className="hero-desc">{t.hero.desc}</p>

          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">
              <span>{t.hero.cta1}</span>
              <FiArrowDown />
            </a>
            <a href="#contact" className="btn btn-ghost">
              {t.hero.cta2}
            </a>
          </div>

          <div className="hero-social">
            <a href={personal?.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href={personal?.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
            <a href={personal?.email ? `mailto:${personal.email}` : '#'} aria-label="Email">
              <FiMail />
            </a>
          </div>
        </div>
      </div>

      <a href="#about" className="hero-scroll" aria-label="Scroll down">
        <span className="hero-scroll-label">SCROLL</span>
        <span className="hero-scroll-line" />
      </a>
    </section>
  );
}
