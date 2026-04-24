import { useState } from 'react';
import { FiMail, FiMapPin, FiGithub, FiLinkedin, FiSend, FiClock } from 'react-icons/fi';
import { useLang } from '../../hooks/useLang';
import { usePublicPersonal } from '../../hooks/usePublicData';
import { publicApi } from '../../api/publicApi';
import Reveal from '../ui/Reveal';
import SectionHeader from '../ui/SectionHeader';
import './Contact.css';

export default function Contact() {
  const { t, lang } = useLang();
  const { data: personal } = usePublicPersonal();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });

  const responseTime = lang === 'tr'
    ? 'Genelde 24 saat içinde yanıt'
    : 'Usually responds within 24h';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      await publicApi.submitContact({
        name: form.name,
        email: form.email,
        message: form.message,
        lang,
        website: form.website, // honeypot
      });
      setSent(true);
      setForm({ name: '', email: '', message: '', website: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      const fallback = personal?.email
        ? (lang === 'tr'
          ? `Gönderilemedi. Doğrudan mail atabilirsin: ${personal.email}`
          : `Failed to send. Email directly: ${personal.email}`)
        : (lang === 'tr' ? 'Gönderilemedi, tekrar dener misin?' : 'Failed to send, please try again.');
      setError(err?.message ? `${err.message} — ${fallback}` : fallback);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <SectionHeader variant="card" tag={t.contact.tag} title={t.contact.title} desc={t.contact.desc} />

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
                  <h3 className="contact-card-name">{personal?.name ?? 'Furkan Paşaoğlu'}</h3>
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
                    <a href={personal?.email ? `mailto:${personal.email}` : '#'} className="contact-card-row-value">
                      {personal?.email}
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
          </Reveal>

          {/* ── Clean form ── */}
          <Reveal className="contact-form-wrap" delay={150}>
            <form className="contact-form glass" onSubmit={handleSubmit}>
              <div className="contact-form-header">
                <h3 className="contact-form-title">
                  {lang === 'tr' ? 'Mesaj gönder' : 'Send a message'}
                </h3>
                <p className="contact-form-hint">
                  {lang === 'tr'
                    ? 'Formu doldur, en kısa sürede dönüş yapacağım.'
                    : "Fill out the form — I'll get back to you shortly."}
                </p>
              </div>

              {/* Honeypot — hidden from humans, bots fill it in */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-5000px', width: 1, height: 1, opacity: 0 }}
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />

              <div className="contact-field">
                <label htmlFor="c-name">{t.contact.name}</label>
                <input
                  id="c-name"
                  type="text"
                  required
                  minLength={2}
                  placeholder={t.contact.namePlaceholder}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="c-email">{t.contact.emailLabel}</label>
                <input
                  id="c-email"
                  type="email"
                  required
                  placeholder={t.contact.emailPlaceholder}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="c-msg">{t.contact.message}</label>
                <textarea
                  id="c-msg"
                  rows={6}
                  required
                  placeholder={t.contact.messagePlaceholder}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary contact-submit ${sent ? 'is-sent' : ''}`}
                disabled={sending}
              >
                {sent ? t.contact.sent : (
                  <>
                    <FiSend /> {sending ? (lang === 'tr' ? 'Gönderiliyor...' : 'Sending...') : t.contact.send}
                  </>
                )}
              </button>
              {error && (
                <div className="contact-form-error" role="alert" style={{ marginTop: 12, color: '#ff6b6b', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
