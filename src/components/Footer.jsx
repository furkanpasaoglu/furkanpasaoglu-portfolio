import { FiHeart, FiGithub, FiLinkedin, FiArrowUp } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <a href="#hero" className="footer-logo">
            <span className="logo-bracket">&lt;</span>FP<span className="logo-bracket">/&gt;</span>
          </a>

          <p className="footer-copy">
            <FiHeart className="heart-icon" /> {t.footer.made} Furkan Pasaoglu · {new Date().getFullYear()}
          </p>

          <div className="footer-right">
            <a href="https://github.com/furkanpasaoglu" target="_blank" rel="noreferrer" aria-label="GitHub"><FiGithub /></a>
            <a href="https://www.linkedin.com/in/furkanpasaoglu/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
            <button onClick={scrollTop} className="scroll-top-btn" aria-label="Scroll to top">
              <FiArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
