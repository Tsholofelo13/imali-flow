import { SLOW_REQUEST_MS } from '../config';

// Tracks slow requests so the app can show "waking up" instead of an error.
type Listener = (slow: boolean) => void;
const listeners = new Set<Listener>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();
let active = 0;
let slow = false;
let nextId = 0;

const emit = () => listeners.forEach((l) => l(slow));

export function beginRequest(): number {
  const id = ++nextId;
  active++;
  timers.set(id, setTimeout(() => { slow = true; emit(); }, SLOW_REQUEST_MS));
  return id;
}

export function endRequest(id: number) {
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
  active = Math.max(0, active - 1);
  if (active === 0 && slow) { slow = false; emit(); }
}

export function subscribeSlow(l: Listener): () => void {
  listeners.add(l);
  l(slow);
  return () => { listeners.delete(l); };
}
