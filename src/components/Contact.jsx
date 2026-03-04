import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiMail, FiMapPin, FiSend, FiGithub, FiLinkedin } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import { LINKS, PERSONAL } from '../data/constants';
import SectionHeader from './shared/SectionHeader';
import './Contact.css';

const SOCIALS = [
  { Icon: FiGithub,   label: 'GitHub',   href: LINKS.github },
  { Icon: FiLinkedin, label: 'LinkedIn', href: LINKS.linkedin },
  { Icon: FiMail,     label: 'Email',    href: LINKS.email },
];

export default function Contact() {
  const sectionRef = useRef(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLang();


  useEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current.querySelector('.contact-header');
      gsap.fromTo(header, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 82%', toggleActions: 'play none none reverse' }
      });

      const left = sectionRef.current.querySelector('.contact-info');
      const right = sectionRef.current.querySelector('.contact-form');

      gsap.fromTo(left, { x: -50, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: left, start: 'top 82%', toggleActions: 'play none none reverse' }
      });
      gsap.fromTo(right, { x: 50, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: right, start: 'top 82%', toggleActions: 'play none none reverse' }
      });

      gsap.fromTo('.social-link', { y: 25, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-socials', start: 'top 88%', toggleActions: 'play none none reverse' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${PERSONAL.emailRaw}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    timerRef.current = setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <div className="container">
        <SectionHeader
          tag={t.contact.tag}
          title={t.contact.title}
          desc={t.contact.desc}
          className="contact-header"
        />

        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-item">
              <div className="info-icon"><FiMail /></div>
              <div>
                <p className="info-label">{t.contact.email}</p>
                <a href={LINKS.email} className="info-value">{PERSONAL.emailRaw}</a>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><FiMapPin /></div>
              <div>
                <p className="info-label">{t.contact.location}</p>
                <p className="info-value">{t.contact.locationValue}</p>
              </div>
            </div>

            <div className="availability-badge">
              <div className="avail-dot" />
              <span>{t.contact.available}</span>
            </div>

            <div className="contact-socials">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={s.label}>
                  <span className="social-icon"><s.Icon /></span>
                  <span className="social-label">{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">{t.contact.name}</label>
              <input id="name" name="name" type="text" placeholder={t.contact.namePlaceholder}
                value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t.contact.emailLabel}</label>
              <input id="email" name="email" type="email" placeholder={t.contact.emailPlaceholder}
                value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">{t.contact.message}</label>
              <textarea id="message" name="message" rows={6} placeholder={t.contact.messagePlaceholder}
                value={formData.message} onChange={handleChange} required />
            </div>
            <button type="submit" className={`btn btn-primary form-submit ${submitted ? 'sent' : ''}`}>
              {submitted ? t.contact.sent : (<><FiSend /> {t.contact.send}</>)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
