import { request } from './client';
import { endpoints } from './endpoints';

const get = (url) => request(url, { auth: true });
const post = (url, body) => request(url, { method: 'POST', body, auth: true });
const put = (url, body) => request(url, { method: 'PUT', body, auth: true });
const del = (url) => request(url, { method: 'DELETE', auth: true });

export const adminApi = {
  // ── Auth ──
  login: (username, password) =>
    request(endpoints.authLogin, { method: 'POST', body: { username, password } }),
  logout: () => post(endpoints.authLogout),
  me: () => get(endpoints.me),

  // ── Projects ──
  listProjects: () => get(endpoints.adminProjects),
  getProject: (id) => get(endpoints.adminProject(id)),
  createProject: (dto) => post(endpoints.adminProjects, dto),
  updateProject: (id, dto) => put(endpoints.adminProject(id), dto),
  deleteProject: (id) => del(endpoints.adminProject(id)),
  publishProject: (id) => post(endpoints.adminProjectPublish(id)),
  reorderProjects: (items) => post(endpoints.adminProjectsReorder, items),

  // ── Experience ──
  listExperience: () => get(endpoints.adminExperience),
  getExperience: (id) => get(endpoints.adminExperienceItem(id)),
  createExperience: (dto) => post(endpoints.adminExperience, dto),
  updateExperience: (id, dto) => put(endpoints.adminExperienceItem(id), dto),
  deleteExperience: (id) => del(endpoints.adminExperienceItem(id)),
  publishExperience: (id) => post(endpoints.adminExperiencePublish(id)),

  // ── Skill categories ──
  listSkillCategories: () => get(endpoints.adminSkillCategories),
  getSkillCategory: (id) => get(endpoints.adminSkillCategory(id)),
  createSkillCategory: (dto) => post(endpoints.adminSkillCategories, dto),
  updateSkillCategory: (id, dto) => put(endpoints.adminSkillCategory(id), dto),
  deleteSkillCategory: (id) => del(endpoints.adminSkillCategory(id)),

  // ── Blog ──
  listBlog: () => get(endpoints.adminBlog),
  getBlog: (id) => get(endpoints.adminBlogItem(id)),
  createBlog: (dto) => post(endpoints.adminBlog, dto),
  updateBlog: (id, dto) => put(endpoints.adminBlogItem(id), dto),
  deleteBlog: (id) => del(endpoints.adminBlogItem(id)),
  publishBlog: (id) => post(endpoints.adminBlogPublish(id)),

  // ── Translations ──
  listTranslations: () => get(endpoints.adminTranslations),
  getTranslation: (section) => get(endpoints.adminTranslation(section)),
  upsertTranslation: (section, dto) => put(endpoints.adminTranslation(section), dto),

  // ── Personal ──
  getPersonal: () => get(endpoints.adminPersonal),
  updatePersonal: (dto) => put(endpoints.adminPersonal, dto),

  // ── Site Settings ──
  getSiteSettings: () => get(endpoints.adminSiteSettings),
  updateSiteSettings: (dto) => put(endpoints.adminSiteSettings, dto),
  manualRenderSite: () => post(endpoints.adminSiteSettingsRender),

  // ── System ──
  getSystemInfo: () => get(endpoints.adminSystemInfo),
  clearSystemCache: () => post(endpoints.adminSystemCacheClear),

  // ── Messages (Contact) ──
  listMessages: () => get(endpoints.adminMessages),
  getMessage: (id) => get(endpoints.adminMessage(id)),
  toggleMessageRead: (id) => put(endpoints.adminMessageRead(id)),
  deleteMessage: (id) => del(endpoints.adminMessage(id)),
  testSmtp: (to) => post(endpoints.adminMessageTestSmtp, { to }),

  // ── Uploads ──
  uploadCv: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request(endpoints.adminUploadCv, { method: 'POST', body: fd, auth: true });
  },
  deleteCv: () => del(endpoints.adminUploadCv),
};
