import { usePublicExperience } from '../../hooks/usePublicData';
import { safeUrl } from '../../utils/safeUrl';

/**
 * The record sheet. Prose on the left, a parts list on the right — the two
 * registers an engineering document actually uses.
 */
export default function AboutSheet({ lang, personal }) {
  const tr = lang === 'tr';
  const { data: experience } = usePublicExperience(lang);

  const roles = (experience ?? []).filter((e) => !e.isEducation);
  const current = roles[0];

  return (
    <>
      <div className="bp-eyebrow">{tr ? 'Künye' : 'Record'}</div>
      <h2 className="bp-h">{tr ? 'Ne yapıyorum' : 'What I build'}</h2>

      <div className="bp-cols">
        <div>
          <p className="bp-lede">
            {tr
              ? 'İşimin çoğu görünmeyen tarafta geçiyor: veri modeli, kimlik doğrulama, entegrasyon, dağıtım. Kurumsal sistemlerde çalışıyorum — sipariş akışları, ERP entegrasyonları, servisler arası mesajlaşma.'
              : 'Most of my work happens on the side you do not see: data models, authentication, integrations, deployment. I work on enterprise systems — order flows, ERP integrations, service-to-service messaging.'}
          </p>
          <p className="bp-p">
            {tr
              ? 'Bir şeyi tasarlarken önce sınırları çiziyorum: hangi servis neyi biliyor, hangi veri nerede duruyor, bir şey bozulduğunda ne oluyor. Kod sonra geliyor. Bu portfolyo da öyle kuruldu — içerik veritabanından geliyor, HTML sunucuda üretiliyor, admin paneli aynı API üstünde duruyor.'
              : 'When I design something I draw the boundaries first: which service knows what, where the data lives, what happens when a piece fails. The code comes after. This portfolio was built the same way — content comes from the database, the HTML is rendered server-side, and the admin panel sits on the same API.'}
          </p>
          <p className="bp-p">
            {tr
              ? 'İstanbul’dayım, iki dilde çalışıyorum, ve genelde en sıkıcı çözümü seçiyorum — çünkü nöbetteyken uyanan ben oluyorum.'
              : 'I am in Istanbul, I work in two languages, and I usually pick the boring solution — because I am the one who gets paged.'}
          </p>
        </div>

        <div>
          <div className="bp-eyebrow">{tr ? 'Özellikler' : 'Specification'}</div>
          <div className="bp-spec">
            {current && (
              <>
                <Row k={tr ? 'Görev' : 'Role'} v={current.title} />
                <Row k={tr ? 'Kurum' : 'Organisation'} v={current.company} />
                <Row k={tr ? 'Dönem' : 'Period'} v={current.period} />
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
