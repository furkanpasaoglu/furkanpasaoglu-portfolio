import { toDoc, withHighlights } from '../../utils/richDocModel';
import { RichDoc } from '../../utils/RichDoc';
import { usePublicExperience } from '../../hooks/usePublicData';

/**
 * The trace. Chronology carries information here — each group is one
 * sequence, read in order — so the period leads each row and the rows are
 * ruled like a log rather than boxed like cards.
 *
 * Work and study are split into two labelled groups because the data already
 * distinguishes them (`isEducation`) and mixing them misleads: a skimmer
 * meeting "Senior Software Developer Bootcamp" directly under "Senior
 * Software Developer" reads two jobs.
 */
export default function ExperienceSheet({ lang }) {
  const tr = lang === 'tr';
  const { data, isLoading, isError } = usePublicExperience(lang);
  const rows = data ?? [];

  const roles = rows.filter((r) => !r.isEducation);
  const study = rows.filter((r) => r.isEducation);

  return (
    <>
      <div className="bp-eyebrow">
        {tr ? 'Geçmiş' : 'History'}
        {rows.length > 0 && (
          <span>
            {roles.length} {tr ? 'pozisyon' : plural(roles.length, 'role', 'roles')}
            {' · '}
            {study.length} {tr ? 'eğitim' : plural(study.length, 'qualification', 'qualifications')}
          </span>
        )}
      </div>
      <h2 className="bp-h">{tr ? 'Geçmiş' : 'Background'}</h2>

      {isLoading && <p className="bp-loading">{tr ? 'Kayıtlar okunuyor…' : 'Reading entries…'}</p>}
      {isError && <p className="bp-empty">{tr ? 'Kayıtlar okunamadı.' : 'Entries could not be read.'}</p>}
      {!isLoading && !isError && rows.length === 0 && (
        <p className="bp-empty">{tr ? 'Henüz kayıt yok.' : 'No entries yet.'}</p>
      )}

      <Group label={tr ? 'Deneyim' : 'Experience'} rows={roles} showKind />
      <Group label={tr ? 'Eğitim' : 'Education'} rows={study} />
    </>
  );
}

/**
 * One labelled block. `showKind` is off for study: under an "Education"
 * heading, stamping "Education" on every row again says nothing.
 */
function Group({ label, rows, showKind = false }) {
  if (rows.length === 0) return null;

  return (
    <section className="bp-trace-group">
      <div className="bp-eyebrow bp-eyebrow-tight">
        {label}
        <span>{rows.length}</span>
      </div>

      <div className="bp-trace">
        {rows.map((row) => (
          <TraceRow key={row.id} row={row} showKind={showKind} />
        ))}
      </div>
    </section>
  );
}

function TraceRow({ row, showKind }) {
  // The description is one document now; its bullet lists are what used to be
  // stored as `highlights`. Legacy rows still carry that array, so it is
  // folded in before the split below.
  const doc = withHighlights(toDoc(row.desc), row.highlights);
  const blocks = doc.content ?? [];
  const prose = blocks.filter((n) => n.type !== 'bulletList');
  const twigs = blocks
    .filter((n) => n.type === 'bulletList')
    .flatMap((n) => n.content ?? []);

  return (
    <article className="bp-trace-row">
      <div>
        <div className="bp-trace-when">{row.period}</div>
        {showKind && row.type && <span className="bp-trace-kind">{row.type}</span>}
      </div>

      <div>
        <h3 className="bp-trace-title">{row.title}</h3>
        <div className="bp-trace-org">{row.company}</div>
        <RichDoc value={{ type: 'doc', content: prose }} className="bp-doc" />

        {/* What came out of a role genuinely hangs off it, so the outcomes are
            drawn as branches rather than bullets. The stack is the last
            branch: also an attribute of the role, not a separate block
            floating after it. */}
        {(twigs.length > 0 || row.tech?.length > 0) && (
          <ul className="bp-branch">
            {twigs.map((item, i) => (
              <li key={`t${i}`} className="bp-twig">
                <RichDoc value={{ type: 'doc', content: item.content ?? [] }} className="bp-doc bp-doc-tight" />
              </li>
            ))}

            {row.tech?.length > 0 && (
              <li className="bp-twig bp-twig-tech">
                <span className="bp-chips">
                  {row.tech.map((tech) => <span key={tech} className="bp-chip">{tech}</span>)}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}

const plural = (n, one, many) => (n === 1 ? one : many);
