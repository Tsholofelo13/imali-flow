import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL, REQUEST_TIMEOUT_MS } from '../config';
import { beginRequest, endRequest } from './status';

const TOKEN_KEY = 'imali_token';

// expo-secure-store has no web implementation, so fall back to localStorage on web.
const Store = Platform.OS === 'web'
  ? {
      getItemAsync: async (k: string) => window.localStorage.getItem(k),
      setItemAsync: async (k: string, v: string) => { window.localStorage.setItem(k, v); },
      deleteItemAsync: async (k: string) => { window.localStorage.removeItem(k); },
    }
  : SecureStore;

export const getToken = () => Store.getItemAsync(TOKEN_KEY);
export const saveToken = (t: string) => Store.setItemAsync(TOKEN_KEY, t);
export const clearToken = () => Store.deleteItemAsync(TOKEN_KEY);

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) { onUnauthorized = fn; }

// status 0 = network problem or timeout. message may be '' (screens then use their own text).
export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  form?: FormData;
  auth?: boolean;
};

// Never log request or response bodies: they can contain private text and photos.
export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, form, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (!form && body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const reqId = beginRequest();
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    let data: any = null;
    if (text) { try { data = JSON.parse(text); } catch { data = null; } }
    if (!res.ok) {
      const fields = data && data.fields && typeof data.fields === 'object' && !Array.isArray(data.fields)
        ? (data.fields as Record<string, string>) : undefined;
      const fieldMsg = fields ? Object.values(fields).filter(Boolean).join(' ') : '';
      const message = fieldMsg || data?.message || data?.error || '';
      if (res.status === 401 && auth) onUnauthorized?.();
      throw new ApiError(res.status, String(message), fields);
    }
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, '');
  } finally {
    clearTimeout(timer);
    endRequest(reqId);
  }
}
