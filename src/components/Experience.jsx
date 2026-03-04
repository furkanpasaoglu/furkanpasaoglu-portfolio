import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiBriefcase, FiBookOpen, FiArrowUpRight } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import ExperiencePanel from './ExperiencePanel';
import { experienceData } from '../data/experienceData';
import SectionHeader from './shared/SectionHeader';
import './Experience.css';

export default function Experience() {
  const sectionRef = useRef(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const { t, lang } = useLang();
  const experiences = experienceData[lang] || experienceData.tr;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current.querySelector('.exp-header');
      gsap.fromTo(header, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 82%', toggleActions: 'play none none reverse' }
      });

      const line = sectionRef.current.querySelector('.timeline-line');
      gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1, duration: 1.5, ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current.querySelector('.timeline'),
          start: 'top 80%', end: 'bottom 20%', scrub: 1
        }
      });

      sectionRef.current.querySelectorAll('.timeline-item').forEach((item, i) => {
        gsap.fromTo(item, { x: i % 2 === 0 ? -50 : 50, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 83%', toggleActions: 'play none none reverse' }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [lang]);

  return (
    <>
    <section id="experience" className="experience-section" ref={sectionRef}>
      <div className="container">
        <SectionHeader
          tag={t.experience.tag}
          title={t.experience.title}
          desc={t.experience.desc}
          className="exp-header"
        />

        <div className="timeline">
          <div className="timeline-line" />
          {experiences.map((exp, i) => (
            <div
              key={i}
              className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}${exp.isEducation ? ' edu' : ''}`}
              onClick={() => setSelectedExp(exp)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedExp(exp)}
              style={{ cursor: 'pointer' }}
            >
              <div className="timeline-dot">{exp.isEducation ? <FiBookOpen /> : <FiBriefcase />}</div>
              <div className="timeline-card">
                <div className="timeline-meta">
                  <span className="timeline-period">{exp.period}</span>
                  <span className={`timeline-type${!exp.isEducation ? ' type-work' : ''}`}>{exp.type}</span>
                </div>
                <h3 className="timeline-title">{exp.title}</h3>
                <span className="timeline-company">{exp.company}</span>
                <p className="timeline-desc">{exp.desc}</p>
                <div className="timeline-tech">
                  {exp.tech.map((t) => (
                    <span key={t} className="card-tag">{t}</span>
                  ))}
                </div>
                <div className="timeline-detail-hint">
                  <span>{t.common.details}</span> <FiArrowUpRight />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {selectedExp && (
      <ExperiencePanel exp={selectedExp} onClose={() => setSelectedExp(null)} />
    )}
    </>
  );
}
