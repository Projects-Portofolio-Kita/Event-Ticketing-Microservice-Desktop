/**
 * Session handling for the desktop app.
 *
 * The access token is the same HS256 JWT auth-service issues to the web
 * portal. booking-service and payment-service verify it server-side, so every
 * authenticated call must carry it — see authHeaders(). The userId sent in a
 * reservation body is only a convenience: the server takes identity from the
 * token, never from the payload.
 */

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || '/api/auth';
const SESSION_KEY = 'tickid.session';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  /** Avatar URL; empty/undefined renders the initials fallback. */
  avatar?: string;
}

export interface Session {
  accessToken: string;
  refreshToken?: string;
  user: SessionUser;
}

function loadStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.accessToken || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

let current: Session | null = loadStoredSession();

export function getSession(): Session | null {
  return current;
}

/** Headers every authenticated fetch must carry. Empty when signed out. */
export function authHeaders(): Record<string, string> {
  return current ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

/** Throws when a call requires a signed-in user. */
export function requireSession(): Session {
  if (!current) {
    throw new Error('Sesi Anda belum aktif. Silakan masuk terlebih dahulu.');
  }
  return current;
}

// --- Session change notifications ------------------------------------------
// The React tree keeps its own copy of the session (Navbar, route guards).
// Whenever the module swaps the session (refresh) or drops it (forced logout)
// the tree must follow, otherwise the UI keeps showing a signed-in user whose
// token no longer works.

type SessionListener = (session: Session | null) => void;
const listeners = new Set<SessionListener>();

/** Subscribe to session swaps. Returns the unsubscribe function. */
export function onSessionChange(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  listeners.forEach((listener) => listener(current));
}

export function logout(): void {
  current = null;
  localStorage.removeItem(SESSION_KEY);
  notify();
}

function store(session: Session): Session {
  current = session;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable: the session still works for this run.
  }
  notify();
  return session;
}

// Reads the SessionResponse body: accessToken (or the legacy "token" alias)
// plus the public user profile.
function sessionFrom(body: unknown): Session | null {
  const payload = body as {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    user?: { id?: string; email?: string; name?: string; avatar?: string };
  };
  const accessToken = payload?.accessToken || payload?.token;
  if (!accessToken || !payload?.user?.id) return null;

  return {
    accessToken,
    refreshToken: payload.refreshToken,
    user: {
      id: payload.user.id,
      email: payload.user.email ?? '',
      name: payload.user.name,
      avatar: payload.user.avatar,
    },
  };
}

async function parseMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.message || body.error || `Permintaan gagal (HTTP ${response.status})`;
  } catch {
    return `Permintaan gagal (HTTP ${response.status})`;
  }
}

// --- Access-token refresh ----------------------------------------------------
// auth-service issues access JWTs that live15 minutes (JWT_ACCESS_TTL_MINUTES)
// and a rotating refresh token that lives7 days. Without a refresh, every
// authenticated call — booking, payment — starts failing with
// "Sesi kedaluwarsa. Silakan masuk ulang." a quarter hour after sign-in.

/** Refresh this many seconds before the access token actually dies. */
const REFRESH_SKEW_SECONDS = 60;

/** Reads the `exp` claim without verifying it (verification is server-side). */
function accessExpiry(token: string): number | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = (JSON.parse(json) as { exp?: number }).exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

/** True when the token is expired, or about to expire inside the skew. */
function isAccessStale(token: string): boolean {
  const exp = accessExpiry(token);
  if (exp === null) return false; // Unknown shape: let the server decide.
  return exp - REFRESH_SKEW_SECONDS <= Date.now() / 1000;
}

// Single-flight: concurrent 401s must trigger exactly one refresh, because the
// server rotates the refresh token and revokes the one it just used.
let refreshInFlight: Promise<Session | null> | null = null;

/**
 * Exchanges the stored refresh token for a new session pair.
 * Resolves to null (and clears the session) when the refresh token itself is
 * dead — the only honest answer then is to sign the user out.
 */
function refreshSession(): Promise<Session | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = current?.refreshToken;
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return null;

      const next = sessionFrom(await response.json());
      return next ? store(next) : null;
    } catch {
      // Network hiccup: keep the session, the caller's retry will decide.
      return current;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Drops the session when refresh proves it is dead. */
async function ensureFreshAccess(): Promise<void> {
  if (!current || !isAccessStale(current.accessToken)) return;
  const next = await refreshSession();
  if (!next) logout();
}

/**
 * fetch() for anything that carries a session: refreshes the access token
 * just before it expires, and retries once when the server still answers 401
 * (token died mid-flight). Returns null when the session itself is gone so
 * callers can show "please sign in" instead of a raw HTTP error.
 */
export async function authFetch(
  url: string,
  init: RequestInit = {},
  retried = false
): Promise<Response | null> {
  await ensureFreshAccess();
  if (!current) return null;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke backend. Pastikan layanan berjalan.');
  }

  if (response.status === 401 && !retried) {
    const next = await refreshSession();
    if (!next) {
      logout();
      return null;
    }
    return authFetch(url, init, true);
  }

  return response;
}

async function post(path: string, payload: unknown): Promise<Response> {
  try {
    return await fetch(`${AUTH_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke auth-service. Pastikan backend berjalan.');
  }
}

export async function login(email: string, password: string): Promise<Session> {
  const response = await post('/login', { email, password });
  if (!response.ok) throw new Error(await parseMessage(response));

  const session = sessionFrom(await response.json());
  if (!session) throw new Error('Respons auth-service tidak valid.');
  return store(session);
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<Session> {
  const response = await post('/register', payload);
  if (!response.ok) throw new Error(await parseMessage(response));

  // The backend usually returns a session directly; otherwise sign in right
  // away so the user lands in the app either way.
  const session = sessionFrom(await response.json());
  if (session) return store(session);
  return login(payload.email, payload.password);
}

/** The public profile shape auth-service returns. */
interface PublicUser {
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  canPostEvent?: boolean;
}

/** Replaces the stored user (after a profile edit) and returns it. */
function storeUser(user: SessionUser): SessionUser {
  if (current) {
    store({ ...current, user });
  }
  return user;
}

/** GET /api/v1/auth/me — refresh the profile from the server. */
export async function fetchMe(): Promise<SessionUser> {
  const session = requireSession();

  const response = await authFetch(`${AUTH_BASE_URL}/me`);
  if (!response) throw new Error('Sesi Anda kedaluwarsa. Silakan masuk ulang.');
  if (!response.ok) throw new Error(await parseMessage(response));

  const body = (await response.json()) as { user?: PublicUser };
  if (!body.user?.id) throw new Error('Respons auth-service tidak valid.');

  return storeUser({
    id: body.user.id ?? session.user.id,
    email: body.user.email ?? session.user.email,
    name: body.user.name,
    avatar: body.user.avatar,
  });
}

/**
 * PATCH /api/v1/auth/me — edit the signed-in user's display name and avatar
 * URL (no file upload yet). Pass `avatar: ''` to clear it and fall back to
 * initials; omit the argument to leave it untouched.
 */
export async function updateProfile(name: string, avatar?: string): Promise<SessionUser> {
  const session = requireSession();

  const payload: { name: string; avatar?: string } = { name: name.trim() };
  if (avatar !== undefined) payload.avatar = avatar.trim();

  const response = await authFetch(`${AUTH_BASE_URL}/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response) throw new Error('Sesi Anda kedaluwarsa. Silakan masuk ulang.');
  if (!response.ok) throw new Error(await parseMessage(response));

  const body = (await response.json()) as { user?: PublicUser };
  if (!body.user?.id) throw new Error('Respons auth-service tidak valid.');

  return storeUser({
    id: body.user.id ?? session.user.id,
    email: body.user.email ?? session.user.email,
    name: body.user.name,
    avatar: body.user.avatar,
  });
}
