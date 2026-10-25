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

export function logout(): void {
  current = null;
  localStorage.removeItem(SESSION_KEY);
}

function store(session: Session): Session {
  current = session;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable: the session still works for this run.
  }
  return session;
}

// Reads the SessionResponse body: accessToken (or the legacy "token" alias)
// plus the public user profile.
function sessionFrom(body: unknown): Session | null {
  const payload = body as {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    user?: { id?: string; email?: string; name?: string };
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
