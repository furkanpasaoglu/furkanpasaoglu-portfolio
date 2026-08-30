import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../auth/useAuth';

/**
 * The panel's frame: a titleblock across the top and a numbered rail down
 * the side — the same device the public sheets use, so the two read as one
 * document set. Flat by design: nine nested menus were the old panel's
 * problem, not its look.
 */
const NAV = [
  { to: '/admin', label: 'Özet', end: true },
  { to: '/admin/projects', label: 'Projeler' },
  { to: '/admin/experience', label: 'Geçmiş' },
  { to: '/admin/skills', label: 'Yetkinlik' },
  { to: '/admin/blog', label: 'Notlar' },
  { to: '/admin/personal', label: 'Künye' },
  { to: '/admin/translations', label: 'Metinler' },
  { to: '/admin/terminal', label: 'Terminal' },
  { to: '/admin/site-settings', label: 'Ayarlar' },
  { to: '/admin/messages', label: 'Mesajlar' },
];

export default function AdminShell() {
  const { data: me } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/admin/login', { replace: true });
  };

  const items = NAV.map((n, i) => ({ ...n, no: String(i + 1).padStart(2, '0') }));

  const railLink = (n) => (
    <NavLink
      key={n.to}
      to={n.to}
      end={n.end}
      className={({ isActive }) => (isActive ? 'fp-rail-btn fp-rail-on' : 'fp-rail-btn')}
    >
      <span className="fp-rail-no">{n.no}</span>
      {n.label}
    </NavLink>
  );

  return (
    <div className="fp">
      <header className="fp-title">
        <span className="fp-title-name">fp / admin</span>
        <span className="fp-title-spacer" />
        {me?.username && <span className="fp-title-user">{me.username}</span>}
        <a className="fp-btn fp-btn-quiet" href="/blueprint" target="_blank" rel="noopener noreferrer">
          Siteyi aç
        </a>
        <button
          type="button"
          className="fp-btn fp-btn-quiet"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          Çıkış
        </button>
      </header>

      <nav className="fp-rail-strip" aria-label="Bölümler">
        {items.map(railLink)}
      </nav>

      <div className="fp-body">
        <nav className="fp-rail" aria-label="Bölümler">
          {items.map(railLink)}
        </nav>

        <main className="fp-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
