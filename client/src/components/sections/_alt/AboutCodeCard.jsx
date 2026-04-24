// Alternative "C# code card" themed About design.
// Saved for developer-audience use cases. NOT imported by default.
// To use: in App.jsx replace
//   import About from './components/sections/About';
// with
//   import About from './components/sections/_alt/AboutCodeCard';
import { FiArrowRight, FiDownload, FiMapPin, FiClock } from 'react-icons/fi';
import { useLang } from '../../../hooks/useLang';
import { LINKS } from '../../../data/constants';
import Reveal from '../../ui/Reveal';
import SectionHeader from '../../ui/SectionHeader';
import './AboutCodeCard.css';

export default function About() {
  const { t, lang } = useLang();
  const locationText = lang === 'tr' ? '"İstanbul, Türkiye"' : '"Istanbul, Turkey"';
  const roleText = '"Senior Software Developer"';
  const availableText = lang === 'tr' ? 'Yeni projelere açık' : 'Open to new opportunities';
  const responseText = lang === 'tr' ? 'Genelde 24s içinde yanıt' : 'Replies within 24h';
  const locationLabel = lang === 'tr' ? 'İstanbul, TR' : 'Istanbul, TR';
  const primaryStackLabel = lang === 'tr' ? 'Ana Stack' : 'Primary Stack';

  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionHeader align="left" tag={t.about.tag} title={t.about.title} />

        <div className="about-bento">
          {/* ── Code card (tall, left) ── */}
          <Reveal className="bento-code">
            <div className="code-card">
              <div className="code-card-glow" />
              <div className="code-card-head">
                <span className="code-dot code-dot-r" />
                <span className="code-dot code-dot-y" />
                <span className="code-dot code-dot-g" />
                <span className="code-card-file">Developer.cs</span>
                <span className="code-card-badge">C#</span>
              </div>
              <pre className="code-card-body">
                <span className="cl"><span className="ln">1</span><span className="kw">public class</span> <span className="cls">Developer</span></span>
                <span className="cl"><span className="ln">2</span>{'{'}</span>
                <span className="cl cl-indent"><span className="ln">3</span>    <span className="kw">public string</span> <span className="prop">Name</span> {'{ '}<span className="kw">get</span>{'; }'} = <span className="str">"Furkan Paşaoğlu"</span>;</span>
                <span className="cl cl-indent"><span className="ln">4</span>    <span className="kw">public string</span> <span className="prop">Role</span> {'{ '}<span className="kw">get</span>{'; }'} = <span className="str">{roleText}</span>;</span>
                <span className="cl cl-indent"><span className="ln">5</span>    <span className="kw">public string</span> <span className="prop">Location</span> {'{ '}<span className="kw">get</span>{'; }'} = <span className="str">{locationText}</span>;</span>
                <span className="cl cl-indent"><span className="ln">6</span>    <span className="kw">public int</span> <span className="prop">YearsOfExperience</span> {'=>'} <span className="num">5</span>;</span>
                <span className="cl"><span className="ln">7</span></span>
                <span className="cl cl-indent"><span className="ln">8</span>    <span className="cm">// Primary tech stack</span></span>
                <span className="cl cl-indent"><span className="ln">9</span>    <span className="kw">public string</span>[] <span className="prop">Stack</span> {'{ '}<span className="kw">get</span>{'; }'} = <span className="kw">new</span>[] {'{'}</span>
                <span className="cl cl-indent-2"><span className="ln">10</span>        <span className="str">".NET"</span>, <span className="str">"C#"</span>, <span className="str">"ASP.NET Core"</span>,</span>
                <span className="cl cl-indent-2"><span className="ln">11</span>        <span className="str">"Microservices"</span>, <span className="str">"Docker"</span></span>
                <span className="cl cl-indent"><span className="ln">12</span>    {'};'}</span>
                <span className="cl"><span className="ln">13</span></span>
                <span className="cl cl-indent"><span className="ln">14</span>    <span className="kw">public bool</span> <span className="prop">IsAvailable</span> {'=>'} <span className="kw-true">true</span>;</span>
                <span className="cl"><span className="ln">15</span>{'}'}</span>
              </pre>

              <div className="code-card-status">
                <span className="code-card-status-dot" />
                <span className="code-card-status-text">{availableText}</span>
                <span className="code-card-status-time">{new Date().getFullYear()}</span>
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
              <a href={LINKS.cv} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                {t.about.cta2} <FiDownload />
              </a>
            </div>
          </Reveal>
        </div>

        {/* ── Stats strip (full width) ── */}
        <div className="about-stats">
          {t.about.stats.map((s, i) => (
            <Reveal key={i} className="about-stat glass" delay={i * 90}>
              <div className="about-stat-label">{s.label}</div>
              <div className="about-stat-desc">{s.desc}</div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Unused (keeps linter happy if var unused in branch) */}
      <span hidden>{primaryStackLabel}</span>
    </section>
  );
}
