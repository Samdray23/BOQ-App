const AUTH_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/auth`
  : '/api/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/v1`
  : '/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, string[]> };
}

async function authRequest<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error(
      'Network error: unable to reach the server. Please check your connection and try again.'
    );
  }

  return parseResponse<T>(res);
}

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error(
      'Network error: unable to reach the server. Please check your connection and try again.'
    );
  }

  return parseResponse<T>(res);
}

function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(
        `Server error (${res.status}): the server returned a non-JSON response. Please try again later.`
      );
    }
    throw new Error(
      `Expected a JSON response but received ${contentType || 'no content'}. Please try again later.`
    );
  }

  const text = await res.text();

  if (!text) {
    throw new Error(
      res.ok
        ? 'The server returned an empty response.'
        : `Server error (${res.status}): the server returned an empty response.`
    );
  }

  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned invalid JSON (status ${res.status}). Please try again later.`
    );
  }

  if (!res.ok || !json.success) {
    const details = json.error?.details;
    let message = json.error?.message || `Request failed with status ${res.status}`;
    if (details) {
      const fieldErrors = Object.entries(details)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join('; ');
      message = `${message} — ${fieldErrors}`;
    }
    throw new Error(message);
  }

  return json.data as T;
}

export interface OnboardingApiResponse {
  completed: boolean;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  companyName: string | null;
  companySize: string | null;
  country: string | null;
  region: string | null;
  experienceLevel: string | null;
  estimationStandards: string[];
  goals: string[];
  aiMode: string | null;
}

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string; role?: string }) =>
      authRequest<{
        message: string;
        user?: { id: string; name: string; email: string; role: string; isVerified: boolean };
        token?: string;
        onboardingCompleted?: boolean;
      }>('POST', '/register', body),

    login: (body: { email: string; password: string }) =>
      authRequest<{ user: { id: string; name: string; email: string; role: string; isVerified: boolean }; token: string; onboardingCompleted: boolean }>('POST', '/login', body),

    verify: (token: string) =>
      authRequest<{
        message: string;
        user?: { id: string; name: string; email: string; role: string; isVerified: boolean };
        token?: string;
        onboardingCompleted?: boolean;
      }>('GET', `/verify/${token}`),

    me: (token: string) =>
      authRequest<{ user: { id: string; name: string; email: string; role: string; isVerified: boolean } }>('GET', '/me', undefined, token),

    resendVerification: (email: string) =>
      authRequest<{ message: string }>('POST', '/resend-verification', { email }),

    googleLogin: (credential: string) =>
      authRequest<{ user: { id: string; name: string; email: string; role: string; isVerified: boolean }; token: string; onboardingCompleted: boolean }>('POST', '/google', { credential }),

    forgotPassword: (email: string) =>
      authRequest<{ message: string }>('POST', '/forgot-password', { email }),

    resetPassword: (token: string, password: string) =>
      authRequest<{ message: string }>('POST', '/reset-password', { token, password }),
  },

  onboarding: {
    get: () =>
      apiRequest<OnboardingApiResponse>('GET', '/onboarding'),

    save: (data: Record<string, unknown>) =>
      apiRequest<OnboardingApiResponse>('PUT', '/onboarding', data),
  },
};
