import Reveal from './Reveal';

/**
 * variant:
 *   'default' — centered tag/title/desc (legacy)
 *   'accent'  — left-aligned with vertical gradient bar
 *   'card'    — glass card wrapping the header
 */
export default function SectionHeader({ tag, title, desc, variant = 'default', align }) {
  // legacy: align='left' maps to accent variant
  const resolved = align === 'left' ? 'accent' : variant;

  const inner = (
    <>
      {tag && (
        <Reveal as="span" className="section-tag">
          {tag}
        </Reveal>
      )}
      <Reveal as="h2" className="section-title" delay={100}>
        {title}
      </Reveal>
      {desc && (
        <Reveal as="p" className="section-desc" delay={200}>
          {desc}
        </Reveal>
      )}
    </>
  );

  if (resolved === 'accent') {
    return (
      <div className="section-header section-header-accent">
        <span className="section-header-bar" aria-hidden="true" />
        <div className="section-header-content">{inner}</div>
      </div>
    );
  }

  if (resolved === 'card') {
    return (
      <div className="section-header section-header-card">
        <div className="section-header-card-glow" />
        <div className="section-header-content">{inner}</div>
      </div>
    );
  }

  return <div className="section-header section-header-center">{inner}</div>;
}
