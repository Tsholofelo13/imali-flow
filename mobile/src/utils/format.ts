export function rand(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return 'R0';
  const whole = Math.abs(n % 1) < 0.005;
  const fixed = Math.abs(n).toFixed(whole ? 0 : 2);
  const [i, d] = fixed.split('.');
  const spaced = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${n < 0 ? '-' : ''}R${spaced}${d ? '.' + d : ''}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]}`;
}

export function toNum(s: string): number {
  return parseFloat(s.replace(/\s/g, '').replace(',', '.'));
}

export function levelOf(v: string | undefined | null): 'low' | 'medium' | 'high' {
  const s = String(v ?? '').toLowerCase();
  return s === 'high' || s === 'low' ? s : 'medium';
}
