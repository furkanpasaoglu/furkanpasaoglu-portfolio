import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastHost } from './ui';
import './admin.css';

/**
 * Admin root. No UI framework — the panel is built on the blueprint's own
 * tokens, so the public sheets and the tool that edits them stay one design.
 */
export default function AdminApp() {
  // The panel owns the viewport; the public site's body wash must not bleed.
  useEffect(() => {
    document.body.classList.add('fp-host');
    return () => document.body.classList.remove('fp-host');
  }, []);

  useEffect(() => {
    if (document.getElementById('fp-fonts')) return;
    const link = document.createElement('link');
    link.id = 'fp-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2'
      + '?family=IBM+Plex+Mono:wght@400;500;600'
      + '&family=IBM+Plex+Sans:wght@400;500'
      + '&family=IBM+Plex+Sans+Condensed:wght@500;600'
      + '&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <ToastHost>
      <Outlet />
    </ToastHost>
  );
}
