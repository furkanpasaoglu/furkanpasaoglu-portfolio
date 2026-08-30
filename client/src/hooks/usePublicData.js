import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/publicApi';

const staleTime = 5 * 60_000;

export const usePublicProjects = (lang) => useQuery({
  queryKey: ['public', 'projects', lang],
  queryFn: () => publicApi.getProjects(lang),
  staleTime,
});

export const usePublicExperience = (lang) => useQuery({
  queryKey: ['public', 'experience', lang],
  queryFn: () => publicApi.getExperience(lang),
  staleTime,
});

export const usePublicSkills = (lang) => useQuery({
  queryKey: ['public', 'skills', lang],
  queryFn: () => publicApi.getSkills(lang),
  staleTime,
});

export const usePublicBlog = (lang) => useQuery({
  queryKey: ['public', 'blog', lang],
  queryFn: () => publicApi.getBlog(lang),
  staleTime,
});

export const usePublicBlogPost = (slug, lang) => useQuery({
  queryKey: ['public', 'blog', 'post', slug, lang],
  queryFn: () => publicApi.getBlogPost(slug, lang),
  staleTime,
  enabled: !!slug,
});

export const usePublicPersonal = (lang) => useQuery({
  // The CV link is language-picked on the server, so the language is part of
  // what identifies this response.
  queryKey: ['public', 'personal', lang],
  queryFn: () => publicApi.getPersonal(lang),
  staleTime,
});

export const usePublicTerminalCommands = (lang) => useQuery({
  queryKey: ['public', 'terminal-commands', lang],
  queryFn: () => publicApi.getTerminalCommands(lang),
  staleTime,
});
