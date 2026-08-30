/**
 * Defence in depth for links whose target comes from the database.
 *
 * The API now rejects anything that is not http(s) or a site-relative path,
 * but rows written before that rule existed are still in the table — and a
 * `javascript:` value in an href runs as soon as a visitor clicks it. This
 * refuses the value rather than rendering a live link.
 *
 * Returns `undefined` for anything unsafe, so `<a href={safeUrl(x)}>` simply
 * renders a link with no target instead of an executable one.
 */
export function safeUrl(value) {
  if (typeof value !== 'string') return undefined;

  const url = value.trim();
  if (!url) return undefined;

  // Site-relative, but not protocol-relative ("//evil.com") and not a
  // backslash form that some browsers normalise to "//".
  if (url.startsWith('/')) {
    return url.startsWith('//') || url.includes('\\') ? undefined : url;
  }

  if (url.startsWith('#') || url.startsWith('mailto:')) return url;

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}
