import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiX, FiGithub, FiExternalLink, FiUsers } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import './ProjectPanel.css';

export default function ProjectPanel({ project, onClose }) {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const { t } = useLang();
  const m = t.projects.modal;

  useEffect(() => {
    if (!project) return;

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const overlay = overlayRef.current;

    gsap.fromTo(overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: 'power2.out' }
    );

    gsap.fromTo(panel,
      { x: '100%' },
      { x: '0%', duration: 0.5, ease: 'power3.out', delay: 0.05 }
    );

    gsap.fromTo(panel.querySelectorAll('.pp-animate'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 0.3 }
    );

    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [project]);

  const handleClose = () => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;

    gsap.to(panel, { x: '100%', duration: 0.4, ease: 'power3.in' });
    gsap.to(overlay, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        document.body.style.overflow = '';
        onClose();
      }
    });
  };

  if (!project) return null;

  return (
    <div className="project-panel-wrapper">
      <div
        className="pp-overlay"
        ref={overlayRef}
        onClick={handleClose}
      />

      <div className="pp-panel" ref={panelRef}>
        {/* Header */}
        <div className="pp-header pp-animate">
          <div className="pp-header-meta">
            <span className="pp-type-badge" style={{ color: project.color, borderColor: project.color, background: `${project.color}15` }}>
              {project.type}
            </span>
            <span className={`pp-status-badge ${project.status === 'Live' || project.status === 'Yayında' ? 'live' : 'wip'}`}>
              <span className="pp-status-dot" />{project.status}
            </span>
            {project.client && (
              <span className="pp-client-badge"><FiUsers /> {project.client}</span>
            )}
          </div>
          <button className="pp-close" onClick={handleClose} aria-label={m.close}>
            <FiX />
          </button>
        </div>

        {/* Project color bar */}
        <div className="pp-colorbar" style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }} />

        {/* Scrollable Content */}
        <div className="pp-body">
          {/* Title */}
          <div className="pp-animate">
            <h2 className="pp-title">{project.title}</h2>
            <p className="pp-subtitle">{project.shortDesc}</p>
          </div>

          {/* Links */}
          <div className="pp-links pp-animate">
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer" className="btn btn-outline pp-link-btn">
                <FiGithub /> {m.github}
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer" className="btn btn-primary pp-link-btn">
                <FiExternalLink /> {m.live}
              </a>
            )}
          </div>

          {/* Description */}
          <div className="pp-section pp-animate">
            <p className="pp-long-desc">{project.longDesc}</p>
          </div>

          {/* Highlights */}
          {project.highlights && (
            <div className="pp-section pp-animate">
              <h4 className="pp-section-title">{m.highlights}</h4>
              <ul className="pp-highlights">
                {project.highlights.map((h, i) => (
                  <li key={i}>
                    <span className="pp-check" style={{ color: project.color }}>▸</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack */}
          <div className="pp-section pp-animate">
            <h4 className="pp-section-title">{m.techStack}</h4>
            <div className="pp-tech-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="pp-tech-tag" style={{ borderColor: `${project.color}40`, color: project.color }}>
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
