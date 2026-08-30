import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './context/LanguageProvider';
import { SiteMetaProvider } from './context/SiteMetaProvider';
import MaintenancePage from './components/MaintenancePage';
import { useSiteOperations } from './hooks/useSiteOperations';

// Both are separate chunks. A visitor never downloads the admin, and the
// blueprint's stylesheet arrives with its own chunk rather than the entry.
const AdminRouter = lazy(() => import('./admin/AdminRouter'));
const BlueprintApp = lazy(() => import('./blueprint/BlueprintApp'));

/**
 * The public site: "The Compiler & Architecture Blueprint".
 *
 * Maintenance mode and the sheet visibility switches are both read here,
 * because both are answers to "what should a visitor see at all" — which is
 * a question about the route, not about any one sheet.
 */
function PublicSite() {
  const ops = useSiteOperations();

  if (ops.maintenanceMode) {
    return (
      <MaintenancePage
        messageTr={ops.maintenanceMessage_tr}
        messageEn={ops.maintenanceMessage_en}
      />
    );
  }

  return (
    <Suspense
      fallback={
        // Matte ground while the chunk loads. Inline because the blueprint's
        // stylesheet arrives with the chunk, and the page must not flash
        // white before the boot sequence — that is the first impression.
        <div style={{ position: 'fixed', inset: 0, background: '#0a0b0d', zIndex: 2 }} />
      }
    >
      <BlueprintApp sections={ops.sectionsEnabled} />
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public site ── */}
      <Route
        path="/*"
        element={
          <ErrorBoundary>
            <LanguageProvider>
              <SiteMetaProvider>
                <PublicSite />
              </SiteMetaProvider>
            </LanguageProvider>
          </ErrorBoundary>
        }
      />

      {/* ── Admin (lazy chunk) ── */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={null}>
            <AdminRouter />
          </Suspense>
        }
      />
    </Routes>
  );
}
