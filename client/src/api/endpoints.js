// Base API endpoints. In dev (vite), these hit http://localhost:8080/api via proxy.
// In prod (nginx), /api is same-origin.
export const API_BASE = '/api';

export const endpoints = {
  // Public
  publicProjects: (lang) => `${API_BASE}/public/projects?lang=${lang}`,
  publicProject: (slug, lang) => `${API_BASE}/public/projects/${slug}?lang=${lang}`,

  // Auth
  authLogin: `${API_BASE}/admin/auth/login`,
  authRefresh: `${API_BASE}/admin/auth/refresh`,
  authLogout: `${API_BASE}/admin/auth/logout`,
  me: `${API_BASE}/admin/me`,

  // Admin — Projects
  adminProjects: `${API_BASE}/admin/projects`,
  adminProject: (id) => `${API_BASE}/admin/projects/${id}`,
  adminProjectsReorder: `${API_BASE}/admin/projects/reorder`,
  adminProjectPublish: (id) => `${API_BASE}/admin/projects/${id}/publish`,

  // Admin — Experience
  adminExperience: `${API_BASE}/admin/experience`,
  adminExperienceItem: (id) => `${API_BASE}/admin/experience/${id}`,
  adminExperiencePublish: (id) => `${API_BASE}/admin/experience/${id}/publish`,

  // Admin — Skill categories
  adminSkillCategories: `${API_BASE}/admin/skill-categories`,
  adminSkillCategory: (id) => `${API_BASE}/admin/skill-categories/${id}`,

  // Admin — Blog
  adminBlog: `${API_BASE}/admin/blog`,
  adminBlogItem: (id) => `${API_BASE}/admin/blog/${id}`,
  adminBlogPublish: (id) => `${API_BASE}/admin/blog/${id}/publish`,

  // Admin — Translations
  adminTranslations: `${API_BASE}/admin/translations`,
  adminTranslation: (section) => `${API_BASE}/admin/translations/${section}`,

  // Admin — Personal
  adminPersonal: `${API_BASE}/admin/personal`,

  // Admin — Uploads
  adminUploadCv: `${API_BASE}/admin/uploads/cv`,

  // Admin — Site Settings
  adminSiteSettings: `${API_BASE}/admin/site-settings`,
  adminSiteSettingsRender: `${API_BASE}/admin/site-settings/render`,

  // Public — Site Settings
  publicSiteSettings: (lang) => `${API_BASE}/public/site-settings?lang=${lang}`,

  // System
  adminSystemInfo: `${API_BASE}/admin/system-info`,
  adminSystemCacheClear: `${API_BASE}/admin/system-info/cache-clear`,

  // Contact
  publicContact: `${API_BASE}/public/contact`,
  adminMessages: `${API_BASE}/admin/messages`,
  adminMessage: (id) => `${API_BASE}/admin/messages/${id}`,
  adminMessageRead: (id) => `${API_BASE}/admin/messages/${id}/read`,
  adminMessageTestSmtp: `${API_BASE}/admin/messages/test-smtp`,

  health: `${API_BASE}/health`,
};
