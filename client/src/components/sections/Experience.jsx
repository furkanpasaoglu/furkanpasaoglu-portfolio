import { FiBriefcase, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { useLang } from '../../hooks/useLang';
import { usePublicExperience } from '../../hooks/usePublicData';
import { useSelectableDetail } from '../../hooks/useSelectableDetail';
import Reveal from '../ui/Reveal';
import SectionHeader from '../ui/SectionHeader';
import SlidePanel from '../ui/SlidePanel';
import './Experience.css';

export default function Experience() {
  const { t, lang } = useLang();
  const { selected, select, panelProps } = useSelectableDetail();
  const { data: items = [] } = usePublicExperience(lang);

  return (
    <section id="experience" className="section experience">
      <div className="container">
        <SectionHeader variant="accent" tag={t.experience.tag} title={t.experience.title} desc={t.experience.desc} />

        <div className="xp-timeline">
          <div className="xp-timeline-line">
            <div className="xp-timeline-flow" />
          </div>

          {items.map((xp, i) => (
            <Reveal key={xp.id ?? i} delay={i * 120} className="xp-row">
              <div className="xp-node">
                <div className="xp-node-ring" />
                <div className="xp-node-core">
                  {xp.isEducation ? <FiBookOpen /> : <FiBriefcase />}
                </div>
              </div>

              <button
                type="button"
                className="xp-card glass"
                onClick={() => select(xp)}
              >
                <div className="xp-card-head">
                  <div className="xp-card-period">{xp.period}</div>
                  <div className="xp-card-tag">{xp.type}</div>
                </div>
                <h3 className="xp-card-title">{xp.title}</h3>
                <div className="xp-card-company">{xp.company}</div>
                <p className="xp-card-desc">{xp.desc}</p>
                <div className="xp-card-tech">
                  {xp.tech.slice(0, 6).map((tech) => (
                    <span key={tech} className="xp-card-tech-chip">{tech}</span>
                  ))}
                  {xp.tech.length > 6 && (
                    <span className="xp-card-tech-chip more">+{xp.tech.length - 6}</span>
                  )}
                </div>
                <div className="xp-card-cta">
                  {t.common.details} <FiArrowRight />
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <SlidePanel {...panelProps} ariaLabel="Experience details">
        {selected && (
          <div className="xp-detail">
            <div className="xp-detail-head">
              <div className="xp-detail-period">{selected.period}</div>
              <h2 className="xp-detail-title">{selected.title}</h2>
              <div className="xp-detail-company">{selected.company}</div>
            </div>

            <p className="xp-detail-desc">{selected.desc}</p>

            <div className="xp-detail-section">
              <h4>{t.experience.modal.highlights}</h4>
              <ul className="xp-detail-list">
                {selected.highlights.map((h, i) => (
                  <li key={`${selected.id ?? 'xp'}-h-${i}`}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="xp-detail-section">
              <h4>{t.experience.modal.techStack}</h4>
              <div className="xp-detail-tags">
                {selected.tech.map((tech) => (
                  <span key={tech} className="xp-detail-tag">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </SlidePanel>
    </section>
  );
}
