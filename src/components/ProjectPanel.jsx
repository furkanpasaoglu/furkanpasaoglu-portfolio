import { useRef } from 'react';
import { FiX, FiGithub, FiExternalLink, FiUsers } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import { useSlidePanelAnimation } from '../hooks/useSlidePanelAnimation';
import './ProjectPanel.css';

export default function ProjectPanel({ project, onClose }) {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const { t } = useLang();
  const m = t.projects.modal;

  const { handleClose } = useSlidePanelAnimation(panelRef, overlayRef, onClose, '.pp-animate');

  if (!project) return null;

  return (
    <div className="project-panel-wrapper">
      <div
        className="pp-overlay"
        ref={overlayRef}
        onClick={handleClose}
      />

      <div className="pp-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label={project.title}>
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
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline pp-link-btn">
                <FiGithub /> {m.github}
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary pp-link-btn">
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
