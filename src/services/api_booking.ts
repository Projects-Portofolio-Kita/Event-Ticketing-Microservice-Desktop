/**
 * @file api_booking.ts
 * @description Reservation creation endpoint caller with fallback simulation.
 */

import { SelectedSeat } from '../types/booking';
import { BOOKING_BASE_URL, DEMO_USER_ID, COLDPLAY_EVENT_ID, seatIdToUUID } from './api_config';
import { SeatItemDTO, CreateReservationRequest, ReservationResponse } from './api_types';

export async function createReservation(selectedSeats: SelectedSeat[]): Promise<ReservationResponse> {
  const seatsPayload: SeatItemDTO[] = selectedSeats.map((s) => {
    const rowMatch = s.seatLabel.match(/Baris\s+([A-Za-z0-9]+)/);
    const numMatch = s.seatLabel.match(/No\s+([0-9]+)/);
    return {
      seatId: seatIdToUUID(s.id), section: s.categoryName,
      row: rowMatch ? rowMatch[1] : 'A', number: numMatch ? numMatch[1] : '01', price: s.price,
    };
  });

  const body: CreateReservationRequest = {
    userId: DEMO_USER_ID, eventId: COLDPLAY_EVENT_ID, seats: seatsPayload, currency: 'IDR',
  };

  try {
    const res = await fetch(`${BOOKING_BASE_URL}/reservations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) return { ...(await res.json()), isMock: false };
    if (res.status === 409) {
      const err = await res.json();
      throw new Error(err.message || 'Beberapa kursi yang Anda pilih sedang di-lock atau sudah terjual.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('terjual')) throw error;
    console.warn('[TickId API] Live Booking Service not connected, running simulated reservation.', error);
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const randomRef = 'TICK-CP26-' + Math.floor(100000 + Math.random() * 900000);
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return {
    reservationId: 'res-' + Date.now(), userId: DEMO_USER_ID, eventId: COLDPLAY_EVENT_ID,
    bookingRef: randomRef, status: 'LOCKED', expiresAt, totalAmount: total, currency: 'IDR',
    seats: seatsPayload, createdAt: new Date().toISOString(), isMock: true,
  };
}
