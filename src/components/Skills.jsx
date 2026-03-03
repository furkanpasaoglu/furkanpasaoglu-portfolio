import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SiDotnet, SiDocker,
  SiPostgresql, SiMongodb, SiRedis, SiRabbitmq, SiElasticsearch,
  SiAngular, SiGit, SiJenkins, SiBootstrap, SiJquery, SiMysql,
} from 'react-icons/si';import { FiCpu, FiDatabase, FiCode, FiCloud, FiLink, FiLayers } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import './Skills.css';

gsap.registerPlugin(ScrollTrigger);

// tier: 'expert' | 'proficient' | 'familiar'
const categories = [
  {
    titleKey: 'Backend & .NET',
    skills: [
      { name: 'C#',                        icon: <FiCode />,         tier: 'expert'     },
      { name: '.NET Core / ASP.NET Core',   icon: <SiDotnet />,       tier: 'expert'     },
      { name: '.NET Framework / MVC',       icon: <SiDotnet />,       tier: 'expert'     },
      { name: 'Clean Architecture',         icon: <FiLayers />,       tier: 'expert'     },
      { name: 'Microservices',              icon: <FiCpu />,          tier: 'proficient' },
      { name: 'Asp.Net Boilerplate / ABP.io', icon: <FiLayers />,       tier: 'proficient' },
    ],
  },
  {
    titleKey: 'Database & Integration',
    skills: [
      { name: 'MSSQL / MySQL',              icon: <SiMysql />,        tier: 'expert'     },
      { name: 'PostgreSQL / Oracle',        icon: <SiPostgresql />,   tier: 'proficient' },
      { name: 'MongoDB',                    icon: <SiMongodb />,      tier: 'proficient' },
      { name: 'Microsoft Dynamics 365',     icon: <FiLink />,         tier: 'expert'     },
      { name: 'SAP Integration',            icon: <FiLink />,         tier: 'proficient' },
      { name: 'RabbitMQ / gRPC',            icon: <SiRabbitmq />,     tier: 'proficient' },
    ],
  },
  {
    titleKey: 'DevOps & Frontend',
    skills: [
      { name: 'Git / GitHub / TFS',         icon: <SiGit />,          tier: 'expert'     },
      { name: 'Azure DevOps',               icon: <FiCloud />,        tier: 'proficient' },
      { name: 'Docker',                     icon: <SiDocker />,       tier: 'proficient' },
      { name: 'Redis',                   icon: <SiRedis />,        tier: 'proficient' },
      { name: 'Jenkins / CI-CD',          icon: <SiJenkins />,      tier: 'proficient' },
      { name: 'Angular',                  icon: <SiAngular />,      tier: 'proficient' },
      { name: 'Bootstrap / Kendo UI',     icon: <SiBootstrap />,    tier: 'expert'     },
    ],
  },
];

export default function Skills() {
  const sectionRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.skills-header', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.skills-header', start: 'top 82%', toggleActions: 'play none none reverse' }
      });

      gsap.fromTo('.skills-tier-legend', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15,
        scrollTrigger: { trigger: '.skills-tier-legend', start: 'top 85%', toggleActions: 'play none none reverse' }
      });

      sectionRef.current.querySelectorAll('.skills-category').forEach((cat, i) => {
        gsap.fromTo(cat, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: i * 0.12,
          scrollTrigger: { trigger: cat, start: 'top 87%', toggleActions: 'play none none reverse' }
        });
      });

      sectionRef.current.querySelectorAll('.skill-chip').forEach((chip, i) => {
        gsap.fromTo(chip, { scale: 0.85, opacity: 0 }, {
          scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)', delay: (i % 6) * 0.06,
          scrollTrigger: { trigger: chip, start: 'top 92%', toggleActions: 'play none none reverse' }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" className="skills-section" ref={sectionRef}>
      <div className="container">
        <div className="skills-header">
          <span className="section-tag">{t.skills.tag}</span>
          <h2 className="section-title">{t.skills.title}</h2>
          <p className="section-desc">{t.skills.desc}</p>
        </div>

        {/* Tier legend */}
        <div className="skills-tier-legend">
          <span className="tier-dot tier-expert" />
          <span className="tier-label">{t.skills.tiers.expert}</span>
          <span className="tier-dot tier-proficient" />
          <span className="tier-label">{t.skills.tiers.proficient}</span>
          <span className="tier-dot tier-familiar" />
          <span className="tier-label">{t.skills.tiers.familiar}</span>
        </div>

        <div className="skills-grid">
          {categories.map((cat) => (
            <div key={cat.titleKey} className="skills-category">
              <h3 className="cat-title">{cat.titleKey}</h3>
              <div className="skill-chips">
                {cat.skills.map((skill) => (
                  <div key={skill.name} className={`skill-chip tier-${skill.tier}`}>
                    <span className="chip-icon">{skill.icon}</span>
                    <span className="chip-name">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
