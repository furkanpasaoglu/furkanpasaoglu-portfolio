import { FiArrowRight, FiDownload, FiMapPin, FiClock } from 'react-icons/fi';
import { SiDotnet, SiDocker, SiReact, SiPostgresql } from 'react-icons/si';
import { useLang } from '../../hooks/useLang';
import { usePublicPersonal } from '../../hooks/usePublicData';
import Reveal from '../ui/Reveal';
import SectionHeader from '../ui/SectionHeader';
import './About.css';

const STACK_ICONS = [
  { icon: <SiDotnet />, name: '.NET' },
  { icon: <span className="stack-letter">C#</span>, name: 'C#' },
  { icon: <SiPostgresql />, name: 'SQL' },
  { icon: <SiDocker />, name: 'Docker' },
  { icon: <SiReact />, name: 'React' },
];

export default function About() {
  const { t, lang } = useLang();
  const { data: personal } = usePublicPersonal();
  const availableText = lang === 'tr' ? 'Yeni projelere açık' : 'Open to new opportunities';
  const responseText = lang === 'tr' ? 'Genelde 24s içinde yanıt' : 'Replies within 24h';
  const locationLabel = lang === 'tr' ? 'İstanbul, TR' : 'Istanbul, TR';
  const stackLabel = lang === 'tr' ? 'Ana Stack' : 'Core Stack';

  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionHeader variant="card" tag={t.about.tag} title={t.about.title} />

        <div className="about-bento">
          {/* ── Profile card (tall, left) ── */}
          <Reveal className="bento-profile">
            <div className="profile-card">
              <div className="profile-card-glow" />

              <div className="profile-avatar">
                <div className="profile-avatar-ring" />
                <span className="profile-avatar-text">fp</span>
              </div>

              <div className="profile-identity">
                <h3 className="profile-name">{personal?.name ?? 'Furkan Paşaoğlu'}</h3>
                <div className="profile-role">{t.hero.subtitle}</div>
              </div>

              <div className="profile-available">
                <span className="profile-available-dot" />
                {availableText}
              </div>

              <div className="profile-stack">
                <div className="profile-stack-label">{stackLabel}</div>
                <div className="profile-stack-icons">
                  {STACK_ICONS.map((s) => (
                    <span key={s.name} className="profile-stack-icon" title={s.name}>
                      {s.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Quick info cards (top right row) ── */}
          <Reveal className="bento-cell bento-fact bento-fact-loc" delay={100}>
            <div className="bento-fact-icon"><FiMapPin /></div>
            <div className="bento-fact-body">
              <div className="bento-fact-label">{lang === 'tr' ? 'Lokasyon' : 'Location'}</div>
              <div className="bento-fact-value">{locationLabel}</div>
            </div>
          </Reveal>

          <Reveal className="bento-cell bento-fact bento-fact-time" delay={180}>
            <div className="bento-fact-icon"><FiClock /></div>
            <div className="bento-fact-body">
              <div className="bento-fact-label">{lang === 'tr' ? 'Yanıt Süresi' : 'Response'}</div>
              <div className="bento-fact-value">{responseText}</div>
            </div>
          </Reveal>

          {/* ── Bio text (right column, large) ── */}
          <Reveal className="bento-cell bento-bio" delay={220}>
            <p className="about-p">{t.about.p1}</p>
            <p className="about-p">{t.about.p2}</p>
            <p className="about-p">{t.about.p3}</p>
            <div className="about-cta">
              <a href="#contact" className="btn btn-primary">
                {t.about.cta1} <FiArrowRight />
              </a>
              <a href={personal?.cvUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                {t.about.cta2} <FiDownload />
              </a>
            </div>
          </Reveal>
        </div>

        {/* ── Stats strip (full width) ── */}
        <div className="about-stats">
          {t.about.stats.map((s, i) => (
            <Reveal key={s.label ?? i} className="about-stat glass" delay={i * 90}>
              <div className="about-stat-label">{s.label}</div>
              <div className="about-stat-desc">{s.desc}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
