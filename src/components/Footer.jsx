import { FiHeart, FiGithub, FiLinkedin, FiArrowUp } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import { LINKS } from '../data/constants';
import LogoBracket from './shared/LogoBracket';
import './Footer.css';

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <a href="#hero" className="footer-logo">
            <LogoBracket />
          </a>

          <p className="footer-copy">
            <FiHeart className="heart-icon" aria-hidden="true" /> {t.footer.made} Furkan Pasaoglu · {new Date().getFullYear()}
          </p>

          <div className="footer-right">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FiGithub /></a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
            <button onClick={scrollTop} className="scroll-top-btn" aria-label="Scroll to top">
              <FiArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
