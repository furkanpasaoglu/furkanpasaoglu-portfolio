import { request } from './client';
import { endpoints } from './endpoints';

const API = '/api';

export const publicApi = {
  getProjects: (lang) => request(endpoints.publicProjects(lang)),
  getProject: (slug, lang) => request(endpoints.publicProject(slug, lang)),
  getExperience: (lang) => request(`${API}/public/experience?lang=${lang}`),
  getSkills: (lang) => request(`${API}/public/skills?lang=${lang}`),
  getBlog: (lang) => request(`${API}/public/blog?lang=${lang}`),
  getBlogPost: (slug, lang) => request(`${API}/public/blog/${slug}?lang=${lang}`),
  getTranslations: (lang) => request(`${API}/public/translations?lang=${lang}`),
  getTerminalCommands: (lang) => request(`${API}/public/terminal-commands?lang=${lang}`),
  getPersonal: (lang) => request(`${API}/public/personal?lang=${lang}`),
  getSiteSettings: (lang) => request(endpoints.publicSiteSettings(lang)),
  submitContact: (dto) => request(endpoints.publicContact, { method: 'POST', body: dto }),
};
