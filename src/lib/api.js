import { supabase } from './supabase.js';

function resolveApiBase() {
  const configured = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

  if (typeof window === 'undefined') return configured;

  const currentOrigin = window.location.origin.replace(/\/$/, '');
  const currentHost = window.location.hostname;
  const isLocalHost = ['localhost', '127.0.0.1'].includes(currentHost);

  if (!configured) {
    return isLocalHost ? '' : currentOrigin;
  }

  try {
    const parsed = new URL(configured);
    const configuredHost = parsed.hostname;
    const configuredIsLocal = ['localhost', '127.0.0.1'].includes(configuredHost);

    if (!isLocalHost) {
      if (configuredIsLocal) return currentOrigin;
      if (configuredHost.endsWith('.vercel.app') && configuredHost !== currentHost) return currentOrigin;
    }
  } catch {
    return isLocalHost ? '' : currentOrigin;
  }

  return configured;
}

const API_BASE = resolveApiBase();

async function authHeaders() {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...(options.headers || {}),
  };

  const target = `${API_BASE}${path}`;
  const response = await fetch(target, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}
