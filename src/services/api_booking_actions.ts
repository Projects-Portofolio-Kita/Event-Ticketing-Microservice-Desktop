/**
 * @file api_booking_actions.ts
 * @description Reservation confirmation and cancellation endpoints with mock fallbacks.
 */

import { BOOKING_BASE_URL, DEMO_USER_ID, COLDPLAY_EVENT_ID } from './api_config';
import { ReservationResponse } from './api_types';

export async function confirmReservation(reservationId: string): Promise<ReservationResponse> {
  try {
    const response = await fetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/confirm`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.warn('[TickId API] Confirm reservation fallback', error);
  }

  return {
    reservationId, userId: DEMO_USER_ID, eventId: COLDPLAY_EVENT_ID,
    bookingRef: 'TICK-CP26-CONFIRMED', status: 'CONFIRMED', expiresAt: new Date().toISOString(),
    totalAmount: 0, currency: 'IDR', seats: [], createdAt: new Date().toISOString(), isMock: true,
  };
}

export async function cancelReservation(reservationId: string): Promise<void> {
  try {
    await fetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/cancel`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Ignore fallback cancel errors
  }
}
