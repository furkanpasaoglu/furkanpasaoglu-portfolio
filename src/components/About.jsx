import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiCode, FiCpu, FiLayers, FiZap } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import { LINKS } from '../data/constants';
import './About.css';

const statIcons = [<FiCode />, <FiLayers />, <FiCpu />, <FiZap />];

export default function About() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const statsRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current, { x: -60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: textRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
      gsap.fromTo(imageRef.current, { x: 60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: imageRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
      gsap.fromTo('.stat-card', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: statsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="container">
        <div className="about-grid">
          <div className="about-text" ref={textRef}>
            <span className="section-tag">{t.about.tag}</span>
            <h2 className="section-title">{t.about.title}</h2>
            <p className="about-p">{t.about.p1}</p>
            <p className="about-p">{t.about.p2}</p>
            <p className="about-p">{t.about.p3}</p>
            <div className="about-cta-row">
              <a href="#contact" className="btn btn-primary">{t.about.cta1}</a>
              <a href={LINKS.cv} target="_blank" rel="noopener noreferrer" className="btn btn-outline">{t.about.cta2}</a>
            </div>
          </div>

          <div className="about-image-wrap" ref={imageRef}>
            <div className="about-avatar">
              <div className="avatar-inner"><span>FP</span></div>
              <div className="avatar-ring ring-1" />
              <div className="avatar-ring ring-2" />
              <div className="avatar-badge">
                <FiZap />
                <span>Available for work</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-stats" ref={statsRef}>
          {t.about.stats.map((item, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" aria-hidden="true">{statIcons[i]}</div>
              <div className="stat-label">{item.label}</div>
              <div className="stat-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
