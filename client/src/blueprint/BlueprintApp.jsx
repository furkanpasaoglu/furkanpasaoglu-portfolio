import { Component, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { usePublicPersonal } from '../hooks/usePublicData';
import { resolveSheet, sheetIndex, visibleSheets } from './sheetRegistry';
import { siteText } from './siteText';
import BootSequence, { BOOT_FLAG } from './BootSequence';
import CadGrid from './CadGrid';
import TitleBlock from './TitleBlock';
import NavRail from './NavRail';
import Terminal from './Terminal';
import IndexSheet from './sheets/IndexSheet';
import AboutSheet from './sheets/AboutSheet';
import ProjectsSheet from './sheets/ProjectsSheet';
import ExperienceSheet from './sheets/ExperienceSheet';
import SkillsSheet from './sheets/SkillsSheet';
import BlogSheet from './sheets/BlogSheet';
import ContactSheet from './sheets/ContactSheet';
import FaultSheet from './sheets/FaultSheet';
import './blueprint.css';
import './sheets.css';

const FONT_ID = 'bp-fonts';
const FONT_HREF = 'https://fonts.googleapis.com/css2'
  + '?family=IBM+Plex+Mono:wght@400;500;600'
  + '&family=IBM+Plex+Sans:wght@400;500'
  + '&family=IBM+Plex+Sans+Condensed:wght@500;600'
  + '&display=swap';

const SHEET_VIEWS = {
  index: IndexSheet,
  about: AboutSheet,
  projects: ProjectsSheet,
  experience: ExperienceSheet,
  skills: SkillsSheet,
  blog: BlogSheet,
  contact: ContactSheet,
};

export default function BlueprintApp({ sections }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang, t } = useContext(LanguageContext) ?? { lang: 'en' };
  const { data: personal } = usePublicPersonal(lang);

  // Which sheets exist at all is a setting; everything numbered below counts
  // only these, so hiding one renumbers the rest instead of leaving a gap.
  const sheets = useMemo(() => visibleSheets(sections), [sections]);

  // `/projects` → the projects sheet. `/blog/<slug>` → the notes sheet with
  // that note already open, which is what a shared link or a search result
  // has to land on.
  const [requested, deepLink] = useMemo(() => {
    const [first = '', second = ''] = location.pathname.replace(/^\//, '').split('/');
    return [first ? first.toLowerCase() : 'index', second ? decodeURIComponent(second) : null];
  }, [location.pathname]);

  const resolved = resolveSheet(sheets, requested);
  const known = resolved !== null;
  const sheet = known ? resolved : 'index';

  const [booted, setBooted] = useState(() => {
    try { return sessionStorage.getItem(BOOT_FLAG) === '1'; } catch { return false; }
  });
  // Open by default where there is room for it; on a phone it would cover the
  // sheet, so it starts as the launcher pill instead.
  const [termOpen, setTermOpen] = useState(
    () => typeof window === 'undefined' || !window.matchMedia('(max-width: 899px)').matches,
  );

  // The blueprint owns the viewport: nothing behind it scrolls or shows through.
  useEffect(() => {
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    body.classList.add('bp-host');
    return () => {
      body.style.overflow = prevOverflow;
      body.classList.remove('bp-host');
    };
  }, []);

  useEffect(() => {
    if (document.getElementById(FONT_ID)) return;
    const link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  const go = useCallback((key, sub) => {
    const path = key === 'index' ? '/' : `/${key}${sub ? `/${encodeURIComponent(sub)}` : ''}`;
    navigate(path);
  }, [navigate]);

  const setLang = useCallback((code) => {
    if (code !== lang) toggleLang?.();
  }, [lang, toggleLang]);

  const reboot = useCallback(() => {
    try { sessionStorage.removeItem(BOOT_FLAG); } catch { /* private mode */ }
    setBooted(false);
  }, []);

  // Number keys jump straight to a sheet — the rail is numbered for a reason.
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target;
      if (el instanceof HTMLElement
        && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= sheets.length) {
        e.preventDefault();
        go(sheets[n - 1].key);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const i = sheetIndex(sheets, sheet);
        if (i < 0) return;
        const next = e.key === 'ArrowRight'
          ? Math.min(i + 1, sheets.length - 1)
          : Math.max(i - 1, 0);
        if (next !== i) { e.preventDefault(); go(sheets[next].key); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, sheet, sheets]);

  if (!booted) {
    return (
      <div className="bp">
        <BootSequence onDone={() => setBooted(true)} />
      </div>
    );
  }

  const View = SHEET_VIEWS[sheet];
  const tr = lang === 'tr';

  return (
    <div className="bp">
      <CadGrid />

      <span className="bp-tick bp-tick-tl" aria-hidden="true" />
      <span className="bp-tick bp-tick-tr" aria-hidden="true" />
      <span className="bp-tick bp-tick-bl" aria-hidden="true" />
      <span className="bp-tick bp-tick-br" aria-hidden="true" />

      <div className="bp-frame">
        <a className="bp-skip" href="#bp-main">{tr ? 'İçeriğe geç' : 'Skip to content'}</a>

        <TitleBlock
          sheet={known ? sheet : 'fault'}
          sheets={sheets}
          lang={lang}
          onLang={setLang}
          onGo={go}
          name={personal?.name ?? 'Furkan Paşaoğlu'}
          role={siteText(t, lang, 'role')}
        />

        <main className="bp-body" id="bp-main">
          <div
            className={[
              'bp-sheet bp-sheet-enter',
              sheet === 'projects' && known ? 'bp-sheet-fit' : '',
              termOpen ? 'bp-sheet-inset' : '',
            ].filter(Boolean).join(' ')}
            key={known ? sheet : `fault-${requested}`}
          >
            <SheetBoundary lang={lang} onGo={go}>
              {known
                ? <View lang={lang} t={t} personal={personal} sheets={sheets} deepLink={deepLink} onGo={go} />
                : <FaultSheet lang={lang} what={requested} onGo={go} />}
            </SheetBoundary>
          </div>
        </main>

        <footer className="bp-foot">
          {/* On a fault nothing is current: no rail item should read as active. */}
          <NavRail sheet={known ? sheet : ''} sheets={sheets} onGo={go} lang={lang} />
          <span className="bp-foot-spacer" />
          <span className="bp-hint">
            <span className="bp-hint-key">{`1–${sheets.length}`}</span>
            {tr ? 'pafta' : 'sheets'}
            <span className="bp-hint-key">/</span>
            {tr ? 'terminal' : 'terminal'}
          </span>
        </footer>
      </div>

      <Terminal
        open={termOpen}
        onOpen={() => setTermOpen(true)}
        onClose={() => setTermOpen(false)}
        sheet={known ? sheet : requested}
        sheets={sheets}
        lang={lang}
        t={t}
        onGo={go}
        onLang={setLang}
        personal={personal}
        onReboot={reboot}
      />
    </div>
  );
}

/** A render failure inside a sheet shows the fault sheet, not a blank frame. */
class SheetBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prev) {
    if (prev.children !== this.props.children && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return <FaultSheet lang={this.props.lang} what={null} onGo={this.props.onGo} />;
    }
    return this.props.children;
  }
}
