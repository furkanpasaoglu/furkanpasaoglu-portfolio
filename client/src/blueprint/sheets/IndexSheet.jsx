import { sheetLabel, sheetNo, sheetTotal } from '../sheetRegistry';
import { safeUrl } from '../../utils/safeUrl';

/**
 * The cover sheet. A drawing set opens with a title page and a sheet index —
 * so this one does too. No hero statistic, no gradient: the most
 * characteristic artefact in this subject's world is a titled, indexed
 * technical document, so that is what the page opens with.
 */
export default function IndexSheet({ lang, personal, sheets, onGo }) {
  const tr = lang === 'tr';

  return (
    <>
      <div className="bp-eyebrow">{tr ? 'Kapak paftası' : 'Cover sheet'}</div>

      <h2 className="bp-h">
        {personal?.name ?? 'Furkan Paşaoğlu'}
        <br />
        <span className="bp-h-sub">
          {tr ? 'Kıdemli Yazılım Geliştirici' : 'Senior Software Developer'}
        </span>
      </h2>

      <p className="bp-lede">
        {tr
          ? 'Backend sistemleri kuruyorum: .NET, PostgreSQL, kimlik doğrulama ve dağıtım hatları. Baktığın site de onlardan biri — içeriğini yöneten admin paneli, kimlik sunucusu ve kendi HTML’ini üreten render servisi bu repoda duruyor.'
          : 'I build backend systems: .NET, PostgreSQL, identity and deployment pipelines. This site is one of them — the admin panel behind its content, the identity server, and the renderer that writes its own HTML all live in this repository.'}
      </p>

      <div className="bp-cols">
        <div>
          <div className="bp-eyebrow">{tr ? 'Pafta dizini' : 'Sheet index'}</div>
          <div className="bp-spec">
            {sheets.filter((s) => s.key !== 'index').map((s) => (
              <div className="bp-spec-row" key={s.key}>
                <span className="bp-spec-k">{sheetNo(sheets, s.key)} / {sheetTotal(sheets)}</span>
                <span className="bp-spec-v">
                  <button type="button" className="bp-link" onClick={() => onGo(s.key)}>
                    {sheetLabel(s.key, lang)}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bp-eyebrow">{tr ? 'Künye' : 'Record'}</div>
          <div className="bp-spec">
            <Row k={tr ? 'Konum' : 'Location'} v={personal?.location ?? 'İstanbul, TR'} />
            <Row k={tr ? 'Diller' : 'Locales'} v="tr-TR · en-US" />
            <Row k={tr ? 'Yığın' : 'Stack'} v=".NET 9 · PostgreSQL 17 · React 19" />
            <Row k={tr ? 'Kimlik' : 'Identity'} v="Keycloak OIDC (BFF)" />
            {personal?.email && (
              <Row
                k={tr ? 'E-posta' : 'Email'}
                v={<a className="bp-link" href={`mailto:${personal.email}`}>{personal.email}</a>}
              />
            )}
            {personal?.cvUrl && (
              <Row
                k="CV"
                v={<a className="bp-link" href={safeUrl(personal.cvUrl)} target="_blank" rel="noopener noreferrer">PDF</a>}
              />
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
