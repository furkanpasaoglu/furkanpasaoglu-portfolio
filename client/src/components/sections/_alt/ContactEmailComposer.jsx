// Alternative "email composer" themed Contact form.
// Saved for developer-audience use cases. NOT imported by default.
// To use: in App.jsx replace
//   import Contact from './components/sections/Contact';
// with
//   import Contact from './components/sections/_alt/ContactEmailComposer';
import { useState } from 'react';
import { FiMail, FiMapPin, FiGithub, FiLinkedin, FiSend, FiClock, FiCopy, FiCheck } from 'react-icons/fi';
import { useLang } from '../../../hooks/useLang';
import { LINKS, PERSONAL } from '../../../data/constants';
import Reveal from '../../ui/Reveal';
import SectionHeader from '../../ui/SectionHeader';
import './ContactEmailComposer.css';

export default function Contact() {
  const { t, lang } = useLang();
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const responseTime = lang === 'tr'
    ? 'Genelde 24 saat içinde yanıt'
    : 'Usually responds within 24h';
  const composeLabel = lang === 'tr' ? 'yeni_mesaj' : 'compose_message';

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio — ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`);
    window.location.href = `mailto:${PERSONAL.emailRaw}?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 3200);
  };

  const handleCopyEmail = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(PERSONAL.emailRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <SectionHeader tag={t.contact.tag} title={t.contact.title} desc={t.contact.desc} />

        <div className="contact-grid">
          {/* ── Business card ── */}
          <Reveal className="contact-side">
            <div className="contact-card glass">
              <div className="contact-card-glow" />

              <div className="contact-card-top">
                <div className="contact-avatar">
                  <div className="contact-avatar-ring" />
                  <span className="contact-avatar-text">fp</span>
                </div>
                <div className="contact-card-identity">
                  <h3 className="contact-card-name">{PERSONAL.name}</h3>
                  <div className="contact-card-role">{t.hero.subtitle}</div>
                </div>
              </div>

              <div className="contact-card-divider" />

              <div className="contact-card-rows">
                <div className="contact-card-row">
                  <div className="contact-card-row-icon">
                    <FiMail />
                  </div>
                  <div className="contact-card-row-body">
                    <div className="contact-card-row-label">{t.contact.email}</div>
                    <a href={LINKS.email} className="contact-card-row-value">
                      {PERSONAL.emailRaw}
                    </a>
                  </div>
                </div>

                <div className="contact-card-row">
                  <div className="contact-card-row-icon">
                    <FiMapPin />
                  </div>
                  <div className="contact-card-row-body">
                    <div className="contact-card-row-label">{t.contact.location}</div>
                    <div className="contact-card-row-value">{t.contact.locationValue}</div>
                  </div>
                </div>

                <div className="contact-card-row">
                  <div className="contact-card-row-icon">
                    <FiClock />
                  </div>
                  <div className="contact-card-row-body">
                    <div className="contact-card-row-label">
                      {lang === 'tr' ? 'Yanıt Süresi' : 'Response Time'}
                    </div>
                    <div className="contact-card-row-value">{responseTime}</div>
                  </div>
                </div>
              </div>

              <div className="contact-availability">
                <span className="contact-dot" />
                {t.contact.available}
              </div>

              <div className="contact-socials">
                <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FiGithub />
                </a>
                <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
                <a href={LINKS.email} aria-label="Email">
                  <FiMail />
                </a>
              </div>
            </div>
          </Reveal>

          {/* ── Email composer ── */}
          <Reveal className="contact-form-wrap" delay={150}>
            <form className="contact-compose" onSubmit={handleSubmit}>
              <div className="compose-head">
                <span className="compose-dot compose-dot-r" />
                <span className="compose-dot compose-dot-y" />
                <span className="compose-dot compose-dot-g" />
                <span className="compose-head-icon"><FiMail /></span>
                <span className="compose-head-title">{composeLabel}.eml</span>
              </div>

              <div className="compose-body">
                <div className="compose-row compose-row-to">
                  <span className="compose-label">To:</span>
                  <span className="compose-value compose-value-mail">{PERSONAL.emailRaw}</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="compose-copy"
                    aria-label="Copy email"
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>

                <div className="compose-row">
                  <label htmlFor="c-email" className="compose-label">From:</label>
                  <input
                    id="c-email"
                    type="email"
                    required
                    placeholder={t.contact.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="compose-input"
                  />
                </div>

                <div className="compose-row">
                  <label htmlFor="c-name" className="compose-label">Name:</label>
                  <input
                    id="c-name"
                    type="text"
                    required
                    placeholder={t.contact.namePlaceholder}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="compose-input"
                  />
                </div>

                <div className="compose-divider" />

                <textarea
                  id="c-msg"
                  rows={7}
                  required
                  placeholder={t.contact.messagePlaceholder}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="compose-textarea"
                />
              </div>

              <div className="compose-foot">
                <span className="compose-foot-hint">
                  {lang === 'tr'
                    ? 'Gönder tuşuna basınca mail istemcin açılır'
                    : 'Clicking Send opens your mail client'}
                </span>
                <button
                  type="submit"
                  className={`btn btn-primary compose-submit ${sent ? 'is-sent' : ''}`}
                >
                  {sent ? t.contact.sent : (
                    <>
                      <FiSend /> {t.contact.send}
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
