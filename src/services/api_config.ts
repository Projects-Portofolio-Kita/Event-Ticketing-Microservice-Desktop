/**
 * @file api_config.ts
 * @description Base API endpoint constants and demo entity identifiers.
 */

export const BOOKING_BASE_URL = import.meta.env.VITE_BOOKING_API_URL || '/api/booking';
export const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || '/api/payment';

export const DEMO_USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
export const COLDPLAY_EVENT_ID = 'e9b533e4-6725-4c07-ba91-039c4a8a0b01';

export function seatIdToUUID(seatId: string): string {
  let hash = 0;
  for (let i = 0; i < seatId.length; i++) {
    hash = (hash << 5) - hash + seatId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${hex.padStart(12, '0')}`;
}
