import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiX, FiBriefcase, FiBookOpen } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import './ExperiencePanel.css';

export default function ExperiencePanel({ exp, onClose }) {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const { t } = useLang();
  const m = t.experience.modal;

  const accentColor = exp.isEducation ? 'var(--accent-alt)' : '#10b981';
  const accentRgb   = exp.isEducation ? '99,179,237' : '16,185,129';

  useEffect(() => {
    if (!exp) return;
    document.body.style.overflow = 'hidden';

    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    gsap.fromTo(panelRef.current,   { x: '100%' },  { x: '0%', duration: 0.5, ease: 'power3.out', delay: 0.05 });
    gsap.fromTo(
      panelRef.current.querySelectorAll('.ep-animate'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 0.3 }
    );

    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [exp]);

  const handleClose = () => {
    gsap.to(panelRef.current,   { x: '100%', duration: 0.4, ease: 'power3.in' });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => { document.body.style.overflow = ''; onClose(); },
    });
  };

  if (!exp) return null;

  return (
    <div className="ep-wrapper">
      <div className="ep-overlay" ref={overlayRef} onClick={handleClose} />

      <div className="ep-panel" ref={panelRef}>
        {/* Color bar */}
        <div className="ep-colorbar" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

        {/* Header */}
        <div className="ep-header ep-animate">
          <div className="ep-header-meta">
            <span
              className="ep-type-badge"
              style={{ color: accentColor, borderColor: accentColor, background: `rgba(${accentRgb},0.08)` }}
            >
              {exp.isEducation ? (exp.type) : <><FiBriefcase style={{ marginRight: 5 }} />{exp.type}</>}
            </span>
            <span className="ep-period">{exp.period}</span>
          </div>
          <button className="ep-close" onClick={handleClose} aria-label={m.close}><FiX /></button>
        </div>

        {/* Scrollable Body */}
        <div className="ep-body">
          <div className="ep-animate">
            <h2 className="ep-title">{exp.title}</h2>
            <span className="ep-company">{exp.company}</span>
          </div>

          <div className="ep-section ep-animate">
            <p className="ep-desc">{exp.desc}</p>
          </div>

          {exp.highlights && (
            <div className="ep-section ep-animate">
              <h4 className="ep-section-title">{m.highlights}</h4>
              <ul className="ep-highlights">
                {exp.highlights.map((h, i) => (
                  <li key={i}>
                    <span className="ep-bullet" style={{ color: accentColor }}>▸</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="ep-section ep-animate">
            <h4 className="ep-section-title">{m.techStack}</h4>
            <div className="ep-tech-tags">
              {exp.tech.map((tag) => (
                <span
                  key={tag}
                  className="ep-tech-tag"
                  style={{ borderColor: `rgba(${accentRgb},0.35)`, color: accentColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
