import { FiGithub, FiLinkedin, FiMail, FiFileText, FiArrowUpRight } from 'react-icons/fi';
import { useLang } from '../../hooks/useLang';
import { usePublicPersonal } from '../../hooks/usePublicData';
import './Footer.css';

export default function Footer() {
  const { t } = useLang();
  const { data: personal } = usePublicPersonal();
  const year = new Date().getFullYear();

  const navItems = [
    { id: 'about', label: t.nav.about },
    { id: 'skills', label: t.nav.skills },
    { id: 'projects', label: t.nav.projects },
    { id: 'experience', label: t.nav.experience },
    { id: 'blog', label: t.nav.blog },
    { id: 'contact', label: t.nav.contact },
  ];

  const handleNav = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-main">
          {/* ── Brand column ── */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="footer-mark">
                <span />
              </span>
              <span className="footer-brand-text">
                fp<span className="footer-brand-accent">/</span>portfolio
              </span>
            </div>
            <p className="footer-tagline">{t.footer.tagline}</p>
            <div className="footer-available">
              <span className="footer-available-dot" />
              {t.footer.availableShort}
            </div>
          </div>

          {/* ── Navigation column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t.footer.nav}</h4>
            <ul className="footer-list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={(e) => handleNav(e, item.id)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Connect column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t.footer.connect}</h4>
            <ul className="footer-list footer-list-connect">
              <li>
                <a href={personal?.github} target="_blank" rel="noopener noreferrer">
                  <FiGithub /> <span>GitHub</span>
                  <FiArrowUpRight className="footer-list-ext" />
                </a>
              </li>
              <li>
                <a href={personal?.linkedin} target="_blank" rel="noopener noreferrer">
                  <FiLinkedin /> <span>LinkedIn</span>
                  <FiArrowUpRight className="footer-list-ext" />
                </a>
              </li>
              <li>
                <a href={personal?.email ? `mailto:${personal.email}` : '#'}>
                  <FiMail /> <span>Email</span>
                </a>
              </li>
              <li>
                <a href={personal?.cvUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                  <FiFileText /> <span>{t.footer.resumePdf}</span>
                  <FiArrowUpRight className="footer-list-ext" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-copy">
            © {year} · {personal?.name ?? 'Furkan Paşaoğlu'}
          </div>
          <div className="footer-built">
            {t.footer.builtWith}{' '}
            <span className="footer-stack">React · Vite</span>
          </div>
          <div className="footer-made">
            {t.footer.made} <span className="footer-heart">♡</span> Istanbul
          </div>
        </div>
      </div>
    </footer>
  );
}
