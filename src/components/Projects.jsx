import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiGithub, FiExternalLink, FiArrowUpRight, FiUsers } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import ProjectPanel from './ProjectPanel';
import { projectsData } from '../data/projectsData';
import { LINKS } from '../data/constants';
import SectionHeader from './shared/SectionHeader';
import './Projects.css';

export default function Projects() {
  const sectionRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const { t, lang } = useLang();

  const projects = projectsData[lang] || projectsData.tr;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current.querySelector('.projects-header');
      gsap.fromTo(header, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 82%', toggleActions: 'play none none reverse' }
      });
      gsap.fromTo('.project-card', { y: 70, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7,
        stagger: { amount: 0.6, from: 'start' }, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current.querySelector('.projects-grid'),
          start: 'top 85%', toggleActions: 'play none none reverse'
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section id="projects" className="projects-section" ref={sectionRef}>
        <div className="container">
          <SectionHeader
            tag={t.projects.tag}
            title={t.projects.title}
            desc={t.projects.desc}
            className="projects-header"
          />

          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.title}
                className="project-card"
                style={{ '--card-color': project.color }}
                onClick={() => setSelectedProject(project)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
              >
                <div className="card-glow" />
                <div className="card-body">
                  <div className="card-header">
                    <div className="card-header-left">
                      <span className="card-type" style={{ color: project.color }}>{project.type}</span>
                  {project.client && (
                    <span className="card-client"><FiUsers /> {project.client}</span>
                  )}
                      <h3 className="card-title">{project.title}</h3>
                    </div>
                    <div className="card-links" onClick={(e) => e.stopPropagation()}>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                          <FiGithub />
                        </a>
                      )}
                      {project.live && (
                        <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label="Live">
                          <FiExternalLink />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="card-desc">{project.shortDesc}</p>
                  <div className="card-tags">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="card-tag">{tag}</span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="card-tag card-tag-more">+{project.tags.length - 4}</span>
                    )}
                  </div>
                  <div className="card-detail-hint">
                    <span>{t.common.details}</span> <FiArrowUpRight />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="projects-footer">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <FiGithub /> {t.projects.viewGithub}
            </a>
          </div>
        </div>
      </section>

      {selectedProject && (
        <ProjectPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
