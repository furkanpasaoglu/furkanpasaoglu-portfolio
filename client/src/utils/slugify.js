export function slugify(title) {
  if (!title) return '';
  const clean = title.split(/[–—&]/)[0].trim();
  const words = clean.split(/\s+/).slice(0, 3);
  return words
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
