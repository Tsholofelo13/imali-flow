import * as SecureStore from 'expo-secure-store';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';
const TOKEN_KEY = 'imali_token';

export const saveToken = (t: string) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

async function request(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const isForm = init.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export async function authenticate(mode: 'login' | 'register', email: string, password: string) {
  const { token } = await request(`/api/auth/${mode}`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await saveToken(token);
}

export const analyseText = (text: string, language = 'en') =>
  request('/api/analysis/text', { method: 'POST', body: JSON.stringify({ text, language }) });

export async function analyseImage(uri: string, language = 'en') {
  const form = new FormData();
  form.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
  form.append('language', language);
  return request('/api/analysis/image', { method: 'POST', body: form });
}

export const forecast = (payload: object) =>
  request('/api/forecast', { method: 'POST', body: JSON.stringify(payload) });
