import { usePublicExperience } from '../../hooks/usePublicData';
import { safeUrl } from '../../utils/safeUrl';
import { siteText } from '../siteText';

/**
 * The record sheet. Prose on the left, a parts list on the right — the two
 * registers an engineering document actually uses.
 */
export default function AboutSheet({ lang, t, personal }) {
  const tr = lang === 'tr';
  const { data: experience } = usePublicExperience(lang);

  // The most recent role, which is not necessarily a current one — a period
  // can have an end date. The label says "most recent" for that reason.
  const roles = (experience ?? []).filter((e) => !e.isEducation);
  const latest = roles[0];

  return (
    <>
      <div className="bp-eyebrow">{tr ? 'Künye' : 'Record'}</div>
      <h2 className="bp-h">{tr ? 'Ne yapıyorum' : 'What I build'}</h2>

      <div className="bp-cols">
        <div>
          <p className="bp-lede">{siteText(t, lang, 'p1')}</p>
          <p className="bp-p">{siteText(t, lang, 'p2')}</p>
          <p className="bp-p">{siteText(t, lang, 'p3')}</p>
        </div>

        <div>
          <div className="bp-eyebrow">{tr ? 'Özellikler' : 'Specification'}</div>
          <div className="bp-spec">
            {latest && (
              <>
                <Row k={tr ? 'Son görev' : 'Most recent role'} v={latest.title} />
                <Row k={tr ? 'Kurum' : 'Organisation'} v={latest.company} />
                <Row k={tr ? 'Dönem' : 'Period'} v={latest.period} />
              </>
            )}
            <Row k={tr ? 'Konum' : 'Location'} v={personal?.location ?? 'İstanbul, TR'} />
            <Row k={tr ? 'Odak' : 'Focus'} v={tr ? 'Backend · entegrasyon · dağıtım' : 'Backend · integration · delivery'} />
            <Row k={tr ? 'Kayıt' : 'Positions'} v={String(roles.length)} />
            {personal?.github && (
              <Row k="GitHub" v={<a className="bp-link" href={safeUrl(personal.github)} target="_blank" rel="noopener noreferrer">{stripHost(personal.github)}</a>} />
            )}
            {personal?.linkedin && (
              <Row k="LinkedIn" v={<a className="bp-link" href={safeUrl(personal.linkedin)} target="_blank" rel="noopener noreferrer">{stripHost(personal.linkedin)}</a>} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }) {
  return (
    <div className="bp-spec-row">
      <span className="bp-spec-k">{k}</span>
      <span className="bp-spec-v">{v}</span>
    </div>
  );
}

function stripHost(url) {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}
