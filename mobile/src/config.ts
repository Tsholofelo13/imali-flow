export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080').replace(/\/$/, '');
export const DEMO_EMAIL = process.env.EXPO_PUBLIC_DEMO_EMAIL ?? '';
export const DEMO_PASSWORD = process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? '';
export const SLOW_REQUEST_MS = 5000; // after this we show "waking up"
export const REQUEST_TIMEOUT_MS = 70000; // free hosting can take about a minute to wake
