import { AuthSession, clearAuthSession, loadAuthSession, saveAuthSession } from '../auth-storage';
import { API_BASE_URL, isApiConfigured } from './base-url';
export { isApiConfigured } from './base-url';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function sendRequest(path: string, init: RequestInit | undefined, session: AuthSession | null): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: init?.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') throw new ApiError('La solicitud tardó demasiado.', 408, 'NETWORK_TIMEOUT');
    throw new ApiError('No se pudo conectar con ListlyBackend.', 0, 'NETWORK_ERROR');
  }
  clearTimeout(timeout);
  return response;
}

async function refreshSession(session: AuthSession): Promise<AuthSession> {
  if (!sessionRefresh) {
    sessionRefresh = performSessionRefresh(session).finally(() => {
      sessionRefresh = null;
    });
  }
  return sessionRefresh;
}

let sessionRefresh: Promise<AuthSession> | null = null;

async function performSessionRefresh(session: AuthSession): Promise<AuthSession> {
  const response = await sendRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: session.refresh_token }),
  }, null);
  const body = (await response.json()) as {
    success?: boolean;
    data?: { session?: AuthSession | null };
    error?: { code?: string; message?: string };
  };
  if (!response.ok || !body.success || !body.data?.session) {
    await clearAuthSession();
    throw new ApiError(body.error?.message || 'La sesión venció. Inicia sesión nuevamente.', response.status, body.error?.code);
  }
  await saveAuthSession(body.data.session);
  return body.data.session;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const requiresAuth = !path.startsWith('/auth/');
  let session = requiresAuth ? await loadAuthSession() : null;
  if (session?.expires_at && session.expires_at * 1000 <= Date.now() + 30000) {
    session = await refreshSession(session);
  }
  let response = await sendRequest(path, init, session);
  if (response.status === 401 && requiresAuth && session) {
    session = await refreshSession(session);
    response = await sendRequest(path, init, session);
  }
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as { success?: boolean; data?: T; error?: { code?: string; message?: string } };
  if (!response.ok || body.success === false) {
    throw new ApiError(body.error?.message || `La API respondió con ${response.status}.`, response.status, body.error?.code);
  }
  return body.data as T;
}

