import { request, ApiError } from './client';
import type {
  AiResult, Forecast, IncomeResult, OfferResult, Profile, ProfileUpdate,
} from '../types';

// Auth
export const register = (email: string, password: string, displayName?: string, language?: string) =>
  request<{ token: string }>('/api/auth/register', {
    method: 'POST', auth: false,
    body: { email, password, ...(displayName ? { displayName } : {}), ...(language ? { language } : {}) },
  });

export const login = (email: string, password: string) =>
  request<{ token: string }>('/api/auth/login', { method: 'POST', auth: false, body: { email, password } });

// Profile
export const getProfile = () => request<Profile>('/api/profile');
export const updateProfile = (patch: ProfileUpdate) =>
  request<Profile>('/api/profile', { method: 'PUT', body: patch });

// Money in and forecast
export const logIncome = (amount: number, source?: string) =>
  request<IncomeResult>('/api/income', { method: 'POST', body: { amount, ...(source ? { source } : {}) } });
export const listIncome = () => request<IncomeResult[]>('/api/income');
export const getForecast = () => request<Forecast>('/api/forecast'); // GET, no body

// AI checks
export const analyseText = (text: string, language: string) =>
  request<AiResult>('/api/analysis/text', { method: 'POST', body: { text, language } });

export function analyseImage(uri: string, language: string) {
  const lower = uri.toLowerCase();
  const type = lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const form = new FormData();
  form.append('file', { uri, name: 'photo', type } as any);
  form.append('language', language);
  return request<AiResult>('/api/analysis/image', { method: 'POST', form });
}

// Rules check and loan cost (works even if the AI is down)
export const analyseOffer = (
  text: string,
  loan?: { principal: number; totalRepayable: number; termDays: number },
) => request<OfferResult>('/api/offers/analyse', { method: 'POST', body: { text, ...(loan ?? {}) } });

// Account
export const deleteAccount = (password: string) =>
  request<void>('/api/account', { method: 'DELETE', body: { password } });

// Wake the free-hosted server. Errors are ignored.
export const wakeServer = () =>
  request<unknown>('/actuator/health', { auth: false }).catch(() => undefined);

export { ApiError };
