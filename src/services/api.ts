import { SeatCategory, SelectedSeat } from '../types/booking';
import { authHeaders, requireSession } from './auth';

// Base API endpoints (proxied via Vite in dev, direct in production)
const BOOKING_BASE_URL = import.meta.env.VITE_BOOKING_API_URL || '/api/booking';
const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || '/api/payment';
const CATALOG_BASE_URL = import.meta.env.VITE_CATALOG_API_URL || '/api/catalog';

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

export interface EventResponse {
  id: string;
  code: string;
  name: string;
  venue: string;
}

// Extracts a readable message from a failed HTTP response
async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.message || body.error || `Permintaan gagal (HTTP ${response.status})`;
  } catch {
    return `Permintaan gagal (HTTP ${response.status})`;
  }
}

/**
 * Calls catalog-service: GET /api/v1/events
 */
export async function fetchEvents(): Promise<EventResponse[]> {
  const response = await fetch(`${CATALOG_BASE_URL}/events`, {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.events ?? [];
}

/**
 * Calls catalog-service: GET /api/v1/events/:id/seatmap
 * Returns SeatCategory[] where each seat carries a real UUID in seatId.
 */
export async function fetchSeatMap(eventId: string): Promise<SeatCategory[]> {
  const response = await fetch(`${CATALOG_BASE_URL}/events/${eventId}/seatmap`, {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.categories ?? [];
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
    result.bookingService = bookingRes.ok;
  } catch {
    // service not reachable
  }

  try {
    const paymentRes = await fetch('/health/payment', { signal: AbortSignal.timeout(1500) });
    result.paymentService = paymentRes.ok;
  } catch {
    // service not reachable
  }

  return result;
}

/**
 * Calls booking-service: POST /api/v1/reservations
 * Requires a signed-in session: the call carries the access token and the
 * server derives the owner from it (userId in the body is ignored).
 */
export async function createReservation(
  selectedSeats: SelectedSeat[],
  eventId: string = COLDPLAY_EVENT_ID
): Promise<ReservationResponse> {
  const session = requireSession();

  const seatsPayload: SeatItemDTO[] = selectedSeats.map((s) => {
    // Prefer row/number from catalog; fall back to parsing label e.g. "Baris A · No 01"
    const rowMatch = s.seatLabel.match(/Baris\s+([A-Za-z0-9]+)/);
    const numMatch = s.seatLabel.match(/No\s+([0-9]+)/);
    const row = s.row ?? (rowMatch ? rowMatch[1] : 'A');
    const number = String(s.number ?? (numMatch ? numMatch[1] : '01'));

    return {
      seatId: s.seatId ?? seatIdToUUID(s.id),
      section: s.categoryName,
      row,
      number,
      price: s.price,
    };
  });

  const requestBody: CreateReservationRequest = {
    userId: session.user.id,
    eventId,
    seats: seatsPayload,
    currency: 'IDR',
  };

  const response = await fetch(`${BOOKING_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data: ReservationResponse = await response.json();
  return { ...data, isMock: false };
}

/**
 * Calls booking-service: POST /api/v1/reservations/:id/confirm
 */
export async function confirmReservation(reservationId: string): Promise<ReservationResponse> {
  const response = await fetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data: ReservationResponse = await response.json();
  return { ...data, isMock: false };
}

/**
 * Calls booking-service: POST /api/v1/reservations/:id/cancel
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  try {
    await fetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
  } catch {
    // Best-effort cancel: ignore network errors
  }
}

/**
 * Calls payment-service: POST /api/v1/payments
 */
export async function createPayment(reservationId: string): Promise<PaymentResponse> {
  const response = await fetch(`${PAYMENT_BASE_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      reservation_id: reservationId,
      payment_method: 'QRIS',
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data: PaymentResponse = await response.json();
  return { ...data, isMock: false };
}

/**
 * Calls payment-service: POST /api/v1/payments/:id/confirm
 */
export async function confirmPayment(paymentId: string): Promise<PaymentResponse> {
  const response = await fetch(`${PAYMENT_BASE_URL}/payments/${paymentId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data: PaymentResponse = await response.json();
  return { ...data, isMock: false };
}
