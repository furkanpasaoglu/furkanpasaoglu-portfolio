// Alternative "git log" themed Experience design.
// Saved for developer-audience use cases. NOT imported by default.
// To use: in App.jsx replace
//   import Experience from './components/sections/Experience';
// with
//   import Experience from './components/sections/_alt/ExperienceGitLog';
import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useLang } from '../../../hooks/useLang';
import { experienceData } from '../../../data/experienceData';
import { PERSONAL } from '../../../data/constants';
import Reveal from '../../ui/Reveal';
import SectionHeader from '../../ui/SectionHeader';
import SlidePanel from '../../ui/SlidePanel';
import './ExperienceGitLog.css';

function hash7(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16).padStart(7, '0').slice(0, 7);
}

export default function ExperienceGitLog() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState(null);
  const items = experienceData[lang] || experienceData.en;
  const arrow = lang === 'tr' ? '→' : '→';

  return (
    <section id="experience" className="section experience">
      <div className="container">
        <SectionHeader tag={t.experience.tag} title={t.experience.title} desc={t.experience.desc} />

        <Reveal className="xp-log-head">
          <span className="xp-log-cmd">
            <span className="xp-log-prompt">$</span> git log <span className="xp-log-flag">--graph</span> <span className="xp-log-flag">--oneline</span>
          </span>
          <span className="xp-log-branch-label">
            <span className="xp-log-branch-dot" />
            main
          </span>
        </Reveal>

        <div className="xp-log">
          {items.map((xp, i) => {
            const hash = hash7(xp.title + xp.period);
            const commitType = xp.isEducation ? 'feat(education)' : 'feat';
            const isCurrent = i === 0 && !xp.isEducation;
            return (
              <Reveal key={i} delay={i * 120} className="xp-row">
                <div className="xp-graph">
                  <span className="xp-graph-dot" />
                  {i < items.length - 1 && <span className="xp-graph-line" />}
                </div>

                <button
                  type="button"
                  className="xp-commit"
                  onClick={() => setSelected(xp)}
                >
                  <div className="xp-commit-hash-row">
                    <span className="xp-commit-token">commit</span>
                    <span className="xp-commit-hash">{hash}</span>
                    {isCurrent && (
                      <span className="xp-commit-refs">
                        <span className="xp-commit-paren">(</span>
                        <span className="xp-ref xp-ref-head">HEAD</span>
                        <span className="xp-ref-arrow">{arrow}</span>
                        <span className="xp-ref xp-ref-branch">current</span>
                        <span className="xp-ref-sep">,</span>
                        <span className="xp-ref xp-ref-remote">origin/main</span>
                        <span className="xp-commit-paren">)</span>
                      </span>
                    )}
                  </div>

                  <div className="xp-commit-meta">
                    <span className="xp-meta-key">Author:</span>
                    <span className="xp-meta-val">{PERSONAL.name}</span>
                  </div>
                  <div className="xp-commit-meta">
                    <span className="xp-meta-key">Date:&nbsp;&nbsp;</span>
                    <span className="xp-meta-val">{xp.period}</span>
                    <span className="xp-meta-sep">·</span>
                    <span className="xp-meta-val xp-meta-type">{xp.type}</span>
                  </div>

                  <div className="xp-commit-msg">
                    <span className={`xp-commit-prefix ${xp.isEducation ? 'prefix-edu' : 'prefix-feat'}`}>
                      {commitType}
                    </span>
                    <span className="xp-commit-colon">:</span>
                    <span className="xp-commit-subject">{xp.title}</span>
                  </div>

                  <div className="xp-commit-company">
                    @ <span>{xp.company}</span>
                  </div>

                  <p className="xp-commit-desc">{xp.desc}</p>

                  <div className="xp-commit-tech">
                    {xp.tech.slice(0, 6).map((tech) => (
                      <span key={tech} className="xp-commit-chip">{tech}</span>
                    ))}
                    {xp.tech.length > 6 && (
                      <span className="xp-commit-chip more">+{xp.tech.length - 6}</span>
                    )}
                  </div>

                  <div className="xp-commit-cta">
                    <span className="xp-commit-cta-arrow">→</span>
                    {t.common.details}
                    <FiArrowRight className="xp-commit-cta-icon" />
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} ariaLabel="Experience details">
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
                  <li key={i}>{h}</li>
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
