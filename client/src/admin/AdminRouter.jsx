import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import AdminApp from './AdminApp';
import AdminShell from './layout/AdminShell';
import LoginPage from './auth/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectEdit from './pages/projects/ProjectEdit';
import ExperienceList from './pages/experience/ExperienceList';
import ExperienceEdit from './pages/experience/ExperienceEdit';
import SkillsList from './pages/skills/SkillsList';
import SkillsEdit from './pages/skills/SkillsEdit';
import BlogList from './pages/blog/BlogList';
import BlogEdit from './pages/blog/BlogEdit';
import TranslationsEditor from './pages/translations/TranslationsEditor';
import PersonalEdit from './pages/personal/PersonalEdit';
import SiteSettingsEdit from './pages/site-settings/SiteSettingsEdit';
import MessagesList from './pages/messages/MessagesList';

export default function AdminRouter() {
  return (
    <Routes>
      <Route element={<ErrorBoundary><AdminApp /></ErrorBoundary>}>
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
