import { useRef } from 'react';
import { FiExternalLink, FiGithub, FiArrowRight } from 'react-icons/fi';
import { useLang } from '../../hooks/useLang';
import { usePublicProjects } from '../../hooks/usePublicData';
import { useSelectableDetail } from '../../hooks/useSelectableDetail';
import Reveal from '../ui/Reveal';
import SectionHeader from '../ui/SectionHeader';
import SlidePanel from '../ui/SlidePanel';
import { slugify } from '../../utils/slugify';
import './Projects.css';

function TiltCard({ project, slug, onOpen, t }) {
  const ref = useRef(null);
  const rafRef = useRef(0);

  const handleEnter = () => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    el.classList.add('is-tilting');
  };

  const handleMove = (e) => {
    const el = ref.current;
    if (!el || !el.classList.contains('is-tilting')) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--rx', `${-y * 4}deg`);
      el.style.setProperty('--ry', `${x * 5}deg`);
      el.style.setProperty('--mx', `${clientX - rect.left}px`);
      el.style.setProperty('--my', `${clientY - rect.top}px`);
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <article
      ref={ref}
      className="proj-card"
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onOpen}
      style={{ '--card-color': project.color }}
    >
      <div className="proj-card-tilt">
        <div className="proj-card-shine" />
        <div className="proj-card-slug">// {slug}</div>
        <div className="proj-card-head">
          <div className="proj-card-type">{project.typeKey}</div>
          <div className={`proj-card-status status-${(project.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
            <i /> {project.status}
          </div>
        </div>

        <h3 className="proj-card-title">{project.title}</h3>
        <p className="proj-card-desc">{project.shortDesc}</p>

        <div className="proj-card-tags">
          {project.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="proj-card-tag">{tag}</span>
          ))}
          {project.tags.length > 5 && (
            <span className="proj-card-tag more">+{project.tags.length - 5}</span>
          )}
        </div>

        <div className="proj-card-foot">
          <button type="button" className="proj-card-more">
            {t.common.details} <FiArrowRight />
          </button>
          <div className="proj-card-icons">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="GitHub"
              >
                <FiGithub />
              </a>
            )}
            {project.live && project.live !== '#' && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Live"
              >
                <FiExternalLink />
              </a>
            )}
          </div>
        </div>

        <div className="proj-card-glow" />
      </div>
    </article>
  );
}

export default function Projects() {
  const { t, lang } = useLang();
  const { selected, select, panelProps } = useSelectableDetail();
  const { data: items = [], isLoading } = usePublicProjects(lang);

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <SectionHeader variant="accent" tag={t.projects.tag} title={t.projects.title} desc={t.projects.desc} />

        {isLoading ? (
          <div className="proj-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="proj-card-skeleton" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <div className="proj-grid">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 100}>
                <TiltCard
                  project={p}
                  slug={p.slug || slugify(p.title)}
                  onOpen={() => select(p)}
                  t={t}
                />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="proj-outro" delay={100}>
          <a
            href="https://github.com/furkanpasaoglu"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <FiGithub /> {t.projects.viewGithub}
          </a>
        </Reveal>
      </div>

      <SlidePanel {...panelProps} ariaLabel="Project details">
        {selected && (
          <div className="proj-detail">
            <div
              className="proj-detail-head"
              style={{ '--card-color': selected.color }}
            >
              <div className="proj-detail-meta">
                <span className="proj-detail-type">{selected.typeKey}</span>
                {selected.client && <span className="proj-detail-client">{selected.client}</span>}
              </div>
              <h2 className="proj-detail-title">{selected.title}</h2>
              <div className="proj-detail-chips">
                <span className="proj-detail-chip">
                  <strong>{t.projects.modal.status}:</strong> {selected.status}
                </span>
              </div>
            </div>

            <p className="proj-detail-desc">{selected.longDesc}</p>

            <div className="proj-detail-section">
              <h4>{t.projects.modal.highlights}</h4>
              <ul className="proj-detail-list">
                {selected.highlights.map((h, i) => (
                  <li key={`${selected.id}-h-${i}`}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="proj-detail-section">
              <h4>{t.projects.modal.techStack}</h4>
              <div className="proj-detail-tags">
                {selected.tags.map((tag) => (
                  <span key={tag} className="proj-detail-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="proj-detail-actions">
              {selected.github && (
                <a
                  href={selected.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <FiGithub /> {t.projects.modal.github}
                </a>
              )}
              {selected.live && selected.live !== '#' && (
                <a
                  href={selected.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  <FiExternalLink /> {t.projects.modal.live}
                </a>
              )}
            </div>
          </div>
        )}
      </SlidePanel>
    </section>
  );
}
