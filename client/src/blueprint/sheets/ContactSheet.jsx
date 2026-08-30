import { useState } from 'react';
import { publicApi } from '../../api/publicApi';
import { safeUrl } from '../../utils/safeUrl';

/**
 * Transmit. Posts to the same rate-limited contact endpoint the main site
 * uses, honeypot field included. Errors say what went wrong and what to do;
 * they do not apologise.
 */
export default function ContactSheet({ lang, personal }) {
  const tr = lang === 'tr';
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [state, setState] = useState({ status: 'idle', text: '' });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (state.status === 'sending') return;
    setState({ status: 'sending', text: '' });

    try {
      await publicApi.submitContact({ ...form, lang });
      setForm({ name: '', email: '', message: '', website: '' });
      setState({
        status: 'ok',
        text: tr
          ? 'Mesaj alındı. Genelde bir iş günü içinde dönüyorum.'
          : 'Message received. I usually reply within a working day.',
      });
    } catch (err) {
      const tooMany = err?.status === 429;
      setState({
        status: 'err',
        text: tooMany
          ? (tr
            ? 'Çok fazla deneme. Bir dakika bekleyip tekrar gönder.'
            : 'Too many attempts. Wait a minute and send it again.')
          : (tr
            ? 'Mesaj gönderilemedi. E-posta ile doğrudan yazabilirsin.'
            : 'The message did not go through. Email me directly instead.'),
      });
    }
  };

  return (
    <>
      <div className="bp-eyebrow">{tr ? 'Kanal' : 'Channel'}</div>
      <h2 className="bp-h">{tr ? 'İletişim' : 'Contact'}</h2>

      <div className="bp-cols">
        <div>
          <p className="bp-lede">
            {tr
              ? 'İş, danışmanlık ya da teknik bir soru — hepsi olur. Ne üzerinde çalıştığını yazarsan daha faydalı cevap veririm.'
              : 'Work, consulting, or a technical question — all fine. Tell me what you are building and I can give you a more useful answer.'}
          </p>

          <form className="bp-form" onSubmit={submit} noValidate>
            <div className="bp-field">
              <label className="bp-label" htmlFor="bp-name">{tr ? 'Ad' : 'Name'}</label>
              <input
                id="bp-name"
                className="bp-input"
                value={form.name}
                onChange={set('name')}
                required
                maxLength={120}
                autoComplete="name"
              />
            </div>

            <div className="bp-field">
              <label className="bp-label" htmlFor="bp-email">{tr ? 'E-posta' : 'Email'}</label>
              <input
                id="bp-email"
                className="bp-input"
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                maxLength={200}
                autoComplete="email"
              />
            </div>

            <div className="bp-field">
              <label className="bp-label" htmlFor="bp-msg">{tr ? 'Mesaj' : 'Message'}</label>
              <textarea
                id="bp-msg"
                className="bp-textarea"
                value={form.message}
                onChange={set('message')}
                required
                maxLength={4000}
              />
            </div>

            {/* Honeypot — the API rejects the submission when this is filled. */}
            <input
              className="bp-hp"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={set('website')}
            />

            <button className="bp-btn" type="submit" disabled={state.status === 'sending'}>
              {state.status === 'sending'
                ? (tr ? 'Gönderiliyor' : 'Sending')
                : (tr ? 'Gönder' : 'Send')}
            </button>

            {state.text && (
              <p
                className={state.status === 'ok' ? 'bp-status bp-status-ok' : 'bp-status bp-status-err'}
                role="status"
              >
                {state.text}
              </p>
            )}
          </form>
        </div>

        <div>
          <div className="bp-eyebrow">{tr ? 'Doğrudan' : 'Direct'}</div>
          <div className="bp-spec">
            {personal?.email && (
              <Row k={tr ? 'E-posta' : 'Email'} v={<a className="bp-link" href={`mailto:${personal.email}`}>{personal.email}</a>} />
            )}
            {personal?.github && (
              <Row k="GitHub" v={<a className="bp-link" href={safeUrl(personal.github)} target="_blank" rel="noopener noreferrer">{tr ? 'Profili aç' : 'Open profile'}</a>} />
            )}
            {personal?.linkedin && (
              <Row k="LinkedIn" v={<a className="bp-link" href={safeUrl(personal.linkedin)} target="_blank" rel="noopener noreferrer">{tr ? 'Profili aç' : 'Open profile'}</a>} />
            )}
            {personal?.cvUrl && (
              <Row k="CV" v={<a className="bp-link" href={safeUrl(personal.cvUrl)} target="_blank" rel="noopener noreferrer">PDF</a>} />
            )}
            <Row k={tr ? 'Konum' : 'Location'} v={personal?.location ?? 'İstanbul, TR'} />
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
