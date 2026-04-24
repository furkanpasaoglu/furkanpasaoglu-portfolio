import { useLang } from '../../hooks/useLang';
import { usePublicSkills } from '../../hooks/usePublicData';
import Reveal from '../ui/Reveal';
import SectionHeader from '../ui/SectionHeader';
import './Skills.css';

const categorySlug = {
  dotnet: 'backend',
  database: 'database',
  devops: 'devops',
};

function MarqueeRow({ category, direction = 'left', speed = 40 }) {
  const items = [...category.skills, ...category.skills];
  const slug = categorySlug[category.icon] || 'stack';

  return (
    <div className="sk-marquee">
      <div className="sk-marquee-label">
        <span className="sk-prompt">&gt;</span>
        <span className="sk-fn">{slug}</span>
        <span className="sk-dim">.stack()</span>
        <span className="sk-marquee-count">{category.skills.length}</span>
      </div>

      <div className="sk-marquee-track-wrap">
        <div
          className={`sk-marquee-track sk-marquee-${direction}`}
          style={{ '--marquee-duration': `${speed}s` }}
        >
          {items.map((s, i) => (
            <span
              key={`${s.name}-${i}`}
              className={`sk-chip tier-${s.tier}`}
              aria-hidden={i >= category.skills.length ? 'true' : undefined}
            >
              <span className="sk-chip-dot" />
              <span className="sk-chip-name">{s.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Skills() {
  const { t, lang } = useLang();
  const { data: skillsCategories = [] } = usePublicSkills(lang);

  return (
    <section id="skills" className="section skills">
      <div className="container">
        <SectionHeader variant="accent" tag={t.skills.tag} title={t.skills.title} desc={t.skills.desc} />

        {/* Tier legend */}
        <Reveal className="sk-legend">
          <span className="legend-chip"><i className="dot tier-expert" />{t.skills.tiers.expert}</span>
          <span className="legend-chip"><i className="dot tier-proficient" />{t.skills.tiers.proficient}</span>
          <span className="legend-chip"><i className="dot tier-familiar" />{t.skills.tiers.familiar}</span>
        </Reveal>

        {/* Scrolling marquee rows per category */}
        <div className="sk-marquees">
          {skillsCategories.map((cat, i) => (
            <Reveal key={i} delay={i * 100}>
              <MarqueeRow
                category={cat}
                direction={i % 2 === 0 ? 'left' : 'right'}
                speed={38 + i * 6}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
