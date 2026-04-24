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

import AdminApp from './admin/AdminApp';
import AdminShell from './admin/layout/AdminShell';
import LoginPage from './admin/auth/LoginPage';
import ProtectedRoute from './admin/auth/ProtectedRoute';
import Dashboard from './admin/pages/Dashboard';
import ProjectsList from './admin/pages/projects/ProjectsList';
import ProjectEdit from './admin/pages/projects/ProjectEdit';
import ExperienceList from './admin/pages/experience/ExperienceList';
import ExperienceEdit from './admin/pages/experience/ExperienceEdit';
import SkillsList from './admin/pages/skills/SkillsList';
import SkillsEdit from './admin/pages/skills/SkillsEdit';
import BlogList from './admin/pages/blog/BlogList';
import BlogEdit from './admin/pages/blog/BlogEdit';
import TranslationsEditor from './admin/pages/translations/TranslationsEditor';
import PersonalEdit from './admin/pages/personal/PersonalEdit';
import SiteSettingsEdit from './admin/pages/site-settings/SiteSettingsEdit';
import MessagesList from './admin/pages/messages/MessagesList';

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

      {/* ── Admin ── */}
      <Route path="/admin" element={<ErrorBoundary><AdminApp /></ErrorBoundary>}>
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminShell />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/:id" element={<ProjectEdit />} />
            <Route path="experience" element={<ExperienceList />} />
            <Route path="experience/:id" element={<ExperienceEdit />} />
            <Route path="skills" element={<SkillsList />} />
            <Route path="skills/:id" element={<SkillsEdit />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/:id" element={<BlogEdit />} />
            <Route path="translations" element={<TranslationsEditor />} />
            <Route path="personal" element={<PersonalEdit />} />
            <Route path="site-settings" element={<SiteSettingsEdit />} />
            <Route path="messages" element={<MessagesList />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
