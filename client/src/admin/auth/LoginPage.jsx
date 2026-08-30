import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMe } from './useAuth';

/**
 * Sign-in is a redirect to Keycloak — the panel never sees a password, so
 * there is no form here, only the handoff and whatever Keycloak sent back.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: me } = useMe();

  const from = location.state?.from?.pathname || '/admin';
  const error = searchParams.get('error');

  useEffect(() => {
    if (me) navigate(from, { replace: true });
  }, [me, from, navigate]);

  return (
    <div className="fp fp-gate">
      <div className="fp-gate-card">
        <div className="fp-eyebrow">Kimlik doğrulama</div>
        <h1 className="fp-h">fp / admin</h1>

        <p className="fp-gate-note">
          Giriş Keycloak üzerinden yapılıyor. Parolan bu panele hiç uğramıyor —
          devam edince kimlik sunucusuna yönlendirileceksin.
        </p>

        {error && (
          <p className="fp-error">
            Giriş başarısız: {error}
          </p>
        )}

        <button
          type="button"
          className="fp-btn fp-btn-primary fp-gate-btn"
          onClick={() => { window.location.href = '/api/admin/auth/login'; }}
        >
          Keycloak ile devam et
        </button>
      </div>
    </div>
  );
}
