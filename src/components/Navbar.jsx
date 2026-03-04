import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LINKS } from '../data/constants';
import LogoBracket from './shared/LogoBracket';
import './Navbar.css';

export default function Navbar() {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();

  const navLinks = useMemo(() => [
    { label: t.nav.about, href: '#about' },
    { label: t.nav.skills, href: '#skills' },
    { label: t.nav.projects, href: '#projects' },
    { label: t.nav.experience, href: '#experience' },
    { label: t.nav.blog, href: '#blog' },
    { label: t.nav.contact, href: '#contact' },
  ], [t]);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav ref={navRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="navbar-inner container">
        <a href="#hero" className="navbar-logo">
          <LogoBracket />
        </a>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} onClick={handleLinkClick}>{link.label}</a>
            </li>
          ))}
          <li>
            <a href={LINKS.cv} className="btn-resume" target="_blank" rel="noopener noreferrer">
              {t.nav.resume}
            </a>
          </li>
          <li>
            <button className="lang-toggle" onClick={() => { toggleLang(); handleLinkClick(); }} aria-label="Toggle language">
              <span className={lang === 'tr' ? 'lang-active' : ''}>TR</span>
              <span className="lang-sep">/</span>
              <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
            </button>
          </li>
          <li>
            <button className="theme-toggle" onClick={() => { toggleTheme(); handleLinkClick(); }} aria-label="Toggle theme">
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
          </li>
        </ul>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
