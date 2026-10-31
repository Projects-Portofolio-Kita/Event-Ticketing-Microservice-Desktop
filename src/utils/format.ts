/**
 * @file format.ts
 * @description Format & display helpers for Rupiah currency and countdown timers.
 */

export * from './pricing';

/**
 * Format numeric value to Indonesian Rupiah currency string (e.g. "Rp 3.500.000").
 */
export function formatRupiah(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rp 0';
  }
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Format seconds countdown into MM:SS format (e.g. 300 -> "05:00").
 */
export function formatTimer(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
