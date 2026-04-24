import { endpoints } from './endpoints';

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

let refreshPromise = null;

/**
 * Fetch wrapper with:
 * - credentials: 'include' for admin calls (so httpOnly cookies are sent)
 * - JSON body + Content-Type handling
 * - auto 1x refresh on 401 when `auth: true`
 */
export async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const res = await fetch(path, {
    method,
    credentials: auth ? 'include' : 'same-origin',
    headers: body instanceof FormData
      ? undefined
      : { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:
      body === undefined || body === null
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
    signal,
  });

  // 401 retry flow (auth calls only, single attempt)
  if (res.status === 401 && auth && !path.includes('/auth/')) {
    try {
      await tryRefreshOnce(signal);
      return request(path, { method, body, auth, signal }); // retry original
    } catch {
      throw new AuthError();
    }
  }

  if (!res.ok) {
    let payload = null;
    try { payload = await res.json(); } catch { /* ignore */ }
    throw new ApiError(res.status, payload?.title || payload?.message || res.statusText, payload);
  }

  if (res.status === 204) return null;

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

async function tryRefreshOnce(signal) {
  refreshPromise ||= fetch(endpoints.authRefresh, {
    method: 'POST',
    credentials: 'include',
    signal,
  }).finally(() => { refreshPromise = null; });

  const res = await refreshPromise;
  if (!res.ok) throw new AuthError();
}
