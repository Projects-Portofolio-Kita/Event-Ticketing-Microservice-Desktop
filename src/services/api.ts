import { SelectedSeat } from '../types/booking';

// Base API endpoints (proxied via Vite in dev, direct in production)
const BOOKING_BASE_URL = import.meta.env.VITE_BOOKING_API_URL || '/api/booking';
const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || '/api/payment';

export const DEMO_USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
export const COLDPLAY_EVENT_ID = 'e9b533e4-6725-4c07-ba91-039c4a8a0b01';

// Helper to generate a valid, RFC4122 v4-compliant UUID from a seat string
export function seatIdToUUID(seatId: string): string {
  let hash = 0;
  for (let i = 0; i < seatId.length; i++) {
    hash = (hash << 5) - hash + seatId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${hex.padStart(12, '0')}`;
}

export interface SeatItemDTO {
  seatId: string;
  section: string;
  row: string;
  number: string;
  price: number;
}

export interface CreateReservationRequest {
  userId: string;
  eventId: string;
  seats: SeatItemDTO[];
  currency: string;
}

export interface ReservationResponse {
  reservationId: string;
  userId: string;
  eventId: string;
  bookingRef: string;
  status: 'LOCKED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  totalAmount: number;
  currency: string;
  seats: {
    seatId: string;
    section: string;
    row: string;
    number: string;
    price: number;
  }[];
  createdAt: string;
  isMock?: boolean;
}

export interface PaymentResponse {
  id: string;
  reservation_id?: string;
  qr_string: string;
  qr_url: string;
  status: string;
  expired_at: string;
  amount: number;
  currency: string;
  isMock?: boolean;
}

export interface BackendHealthStatus {
  bookingService: boolean;
  paymentService: boolean;
}

/**
 * Checks connectivity to Go Microservices
 */
export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  const result: BackendHealthStatus = {
    bookingService: false,
    paymentService: false,
  };

  try {
    const bookingRes = await fetch('/health/booking', { signal: AbortSignal.timeout(1500) });
    if (bookingRes.ok) {
      result.bookingService = true;
    }
  } catch {
    // service not reachable
  }

  try {
    const paymentRes = await fetch('/health/payment', { signal: AbortSignal.timeout(1500) });
    if (paymentRes.ok) {
      result.paymentService = true;
    }
  } catch {
    // service not reachable
  }

  return result;
}

/**
 * Calls booking-service: POST /api/v1/reservations
 */
export async function createReservation(selectedSeats: SelectedSeat[]): Promise<ReservationResponse> {
  const seatsPayload: SeatItemDTO[] = selectedSeats.map((s) => {
    // Parse row and number from label e.g. "Baris A · No 01"
    const rowMatch = s.seatLabel.match(/Baris\s+([A-Za-z0-9]+)/);
    const numMatch = s.seatLabel.match(/No\s+([0-9]+)/);
    const row = rowMatch ? rowMatch[1] : 'A';
    const number = numMatch ? numMatch[1] : '01';

    return {
      seatId: seatIdToUUID(s.id),
      section: s.categoryName,
      row,
      number,
      price: s.price,
    };
  });

  const requestBody: CreateReservationRequest = {
    userId: DEMO_USER_ID,
    eventId: COLDPLAY_EVENT_ID,
    seats: seatsPayload,
    currency: 'IDR',
  };

  try {
    const response = await fetch(`${BOOKING_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data: ReservationResponse = await response.json();
      return { ...data, isMock: false };
    }

    if (response.status === 409) {
      const err = await response.json();
      throw new Error(err.message || 'Beberapa kursi yang Anda pilih sedang di-lock atau sudah terjual.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('terjual')) {
      throw error;
    }
    console.warn('[TickId API] Live Booking Service not connected, running simulated reservation.', error);
  }

  // Graceful fallback simulation matching the exact backend response format
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const randomRef = 'TICK-CP26-' + Math.floor(100000 + Math.random() * 900000);
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return {
    reservationId: 'res-' + Date.now(),
    userId: DEMO_USER_ID,
    eventId: COLDPLAY_EVENT_ID,
    bookingRef: randomRef,
    status: 'LOCKED',
    expiresAt,
    totalAmount: total,
    currency: 'IDR',
    seats: seatsPayload,
    createdAt: new Date().toISOString(),
    isMock: true,
  };
}

/**
 * Calls booking-service: POST /api/v1/reservations/:id/confirm
 */
export async function confirmReservation(reservationId: string): Promise<ReservationResponse> {
  try {
    const response = await fetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[TickId API] Confirm reservation fallback', error);
  }

  return {
    reservationId,
    userId: DEMO_USER_ID,
    eventId: COLDPLAY_EVENT_ID,
    bookingRef: 'TICK-CP26-CONFIRMED',
    status: 'CONFIRMED',
    expiresAt: new Date().toISOString(),
    totalAmount: 0,
    currency: 'IDR',
    seats: [],
    createdAt: new Date().toISOString(),
    isMock: true,
  };
}

/**
 * Calls booking-service: POST /api/v1/reservations/:id/cancel
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  try {
    await fetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Ignore fallback cancel errors
  }
}

/**
 * Calls payment-service: POST /api/v1/payments
 */
export async function createPayment(reservationId: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservation_id: reservationId,
        payment_method: 'qris',
      }),
    });

    if (response.ok) {
      const data: PaymentResponse = await response.json();
      return { ...data, isMock: false };
    }
  } catch (error) {
    console.warn('[TickId API] Live Payment Service not connected, running simulated payment.', error);
  }

  // Graceful fallback simulation
  return {
    id: 'pay-' + Date.now(),
    reservation_id: reservationId,
    qr_string: '00020101021226600016ID.CO.TICKID.WWW01189360099800000000005204581253033605802ID5914TICKID CONCERT6007JAKARTA6304ABCD',
    qr_url: '',
    status: 'PENDING',
    expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    amount: 0,
    currency: 'IDR',
    isMock: true,
  };
}
