import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './context/LanguageProvider';
import { SiteMetaProvider } from './context/SiteMetaProvider';
import { ThemeProvider } from './context/ThemeProvider';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Blog from './components/sections/Blog';
import Contact from './components/sections/Contact';
import { useSiteOperations } from './hooks/useSiteOperations';

// Admin SPA ships as a separate chunk — public visitors never download it.
const AdminRouter = lazy(() => import('./admin/AdminRouter'));

function PublicSite() {
  const { sectionsEnabled } = useSiteOperations();
  return (
    <>
      <Navbar />
      <main>
        {sectionsEnabled.hero && <Hero />}
        {sectionsEnabled.about && <About />}
        {sectionsEnabled.skills && <Skills />}
        {sectionsEnabled.projects && <Projects />}
        {sectionsEnabled.experience && <Experience />}
        {sectionsEnabled.blog && <Blog />}
        {sectionsEnabled.contact && <Contact />}
      </main>
      <Footer />
    </>
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
            <ThemeProvider>
              <LanguageProvider>
                <SiteMetaProvider>
                  <PublicSite />
                </SiteMetaProvider>
              </LanguageProvider>
            </ThemeProvider>
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
