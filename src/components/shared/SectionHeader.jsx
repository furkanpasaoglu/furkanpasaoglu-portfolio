/**
 * Reusable section header: tag + title + optional description.
 * Pass `className` to match the section-specific class that GSAP targets.
 *
 * @param {string} tag        - small label above the title (e.g. t.blog.tag)
 * @param {string} title      - h2 heading
 * @param {string} [desc]     - optional paragraph
 * @param {string} [className]- wrapper div class (default: 'section-header')
 */
export default function SectionHeader({ tag, title, desc, className = 'section-header' }) {
  return (
    <div className={className}>
      <span className="section-tag">{tag}</span>
      <h2 className="section-title">{title}</h2>
      {desc && <p className="section-desc">{desc}</p>}
    </div>
  );
}
