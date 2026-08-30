import { usePublicExperience } from '../../hooks/usePublicData';
import { RichDoc } from '../../utils/RichDoc';
import { safeUrl } from '../../utils/safeUrl';
import { aboutDoc, specRows } from '../siteText';

/**
 * The record sheet. Prose on the left, a parts list on the right — the two
 * registers an engineering document actually uses.
 *
 * Both sides are content. The specification rows are written in the admin
 * panel; the derived list below is only what the sheet shows until they are.
 */
export default function AboutSheet({ lang, t, personal }) {
  const tr = lang === 'tr';
  const { data: experience } = usePublicExperience(lang);

  const roles = (experience ?? []).filter((e) => !e.isEducation);
  const rows = specRows(t?.about) ?? derivedRows(tr, roles, personal);

  return (
    <>
      <div className="bp-eyebrow">{tr ? 'Künye' : 'Record'}</div>
      <h2 className="bp-h">{tr ? 'Ne yapıyorum' : 'What I build'}</h2>

      <div className="bp-cols">
        <RichDoc value={aboutDoc(t, lang)} className="bp-doc bp-doc-record" />

        <div>
          <div className="bp-eyebrow">{tr ? 'Özellikler' : 'Specification'}</div>
          <div className="bp-spec">
            {rows.map((row, i) => <Row key={`${row.k}-${i}`} k={row.k} v={row.v} />)}

            {personal?.github && <Row k="GitHub" v={<Ext url={personal.github} />} />}
            {personal?.linkedin && <Row k="LinkedIn" v={<Ext url={personal.linkedin} />} />}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * What the sheet can work out on its own. The role is labelled "most recent"
 * rather than "current" because a period can have an end date — the sheet
 * must not turn a job that ended into one that is still held.
 */
function derivedRows(tr, roles, personal) {
  const latest = roles[0];

  return [
    latest && { k: tr ? 'Son görev' : 'Most recent role', v: latest.title },
    latest && { k: tr ? 'Kurum' : 'Organisation', v: latest.company },
    latest && { k: tr ? 'Dönem' : 'Period', v: latest.period },
    { k: tr ? 'Konum' : 'Location', v: personal?.location ?? 'İstanbul, TR' },
    { k: tr ? 'Odak' : 'Focus', v: tr ? 'Backend · entegrasyon · dağıtım' : 'Backend · integration · delivery' },
    { k: tr ? 'Kayıt' : 'Positions', v: String(roles.length) },
  ].filter(Boolean);
}

function Row({ k, v }) {
  return (
    <div className="bp-spec-row">
      <span className="bp-spec-k">{k}</span>
      <span className="bp-spec-v">{v}</span>
    </div>
  );
}

function Ext({ url }) {
  return (
    <a className="bp-link" href={safeUrl(url)} target="_blank" rel="noopener noreferrer">
      {stripHost(url)}
    </a>
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
