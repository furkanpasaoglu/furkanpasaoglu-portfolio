import { useEffect, useRef, useState } from 'react';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useLang } from '../../hooks/useLang';
import { useTheme } from '../../hooks/useTheme';
import { useSiteOperations } from '../../hooks/useSiteOperations';
import './Navbar.css';

const ALL_SECTIONS = ['about', 'skills', 'projects', 'experience', 'blog', 'contact'];

export default function Navbar() {
  const { lang, toggleLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { sectionsEnabled } = useSiteOperations();
  const SECTIONS = ALL_SECTIONS.filter((id) => sectionsEnabled[id]);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('hero');
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const linksRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    ['hero', ...SECTIONS].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Sliding indicator: track active link position/size
  useEffect(() => {
    const linksEl = linksRef.current;
    if (!linksEl) return;

    const update = () => {
      const target = linksEl.querySelector(`[data-nav="${active}"]`);
      if (!target) {
        setIndicator((prev) => ({ ...prev, opacity: 0 }));
        return;
      }
      setIndicator({
        left: target.offsetLeft,
        width: target.offsetWidth,
        opacity: 1,
      });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(linksEl);
    const onResize = () => update();
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [active, lang, scrolled]);

  const handleLink = (e, id) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#hero" className="nav-brand" onClick={(e) => handleLink(e, 'hero')}>
            <span className="nav-brand-mark">
              <span className="nav-brand-dot" />
            </span>
            <span className="nav-brand-text">
              fp<span className="nav-brand-accent">/</span>portfolio
            </span>
          </a>

          <nav className="nav-links" ref={linksRef}>
            <span
              className="nav-indicator"
              style={{
                '--ind-left': `${indicator.left}px`,
                '--ind-width': `${indicator.width}px`,
                '--ind-opacity': indicator.opacity,
              }}
              aria-hidden="true"
            />
            {SECTIONS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                data-nav={id}
                onClick={(e) => handleLink(e, id)}
                className={`nav-link ${active === id ? 'is-active' : ''}`}
              >
                {t.nav[id]}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              onClick={toggleLang}
              className="nav-pill"
              aria-label="Toggle language"
            >
              <span className={lang === 'tr' ? 'is-on' : ''}>TR</span>
              <span className="nav-pill-div" />
              <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="nav-icon-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="nav-icon-btn nav-burger"
              aria-label="Toggle menu"
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-drawer ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)}>
        <div className="nav-drawer-inner" onClick={(e) => e.stopPropagation()}>
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleLink(e, id)}
              className={`nav-drawer-link ${active === id ? 'is-active' : ''}`}
            >
              {t.nav[id]}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
