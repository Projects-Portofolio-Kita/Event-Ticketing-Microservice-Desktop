import {
  CityEntry,
  CreateEventPayload,
  EventSummary,
  Reservation,
  SeatCategory,
  SelectedSeat,
  SelectedTicket,
  TicketTypeList,
} from '../types/booking';
import { authFetch, requireSession } from './auth';

// Base API endpoints (proxied via Vite in dev, direct in production)
const BOOKING_BASE_URL = import.meta.env.VITE_BOOKING_API_URL || '/api/booking';
const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || '/api/payment';
const CATALOG_BASE_URL = import.meta.env.VITE_CATALOG_API_URL || '/api/catalog';

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

export interface TicketItemDTO {
  categoryId: string;
  quantity: number;
}

export interface CreateReservationRequest {
  eventId: string;
  mode: 'SEATED' | 'TIER';
  seats?: SeatItemDTO[];
  items?: TicketItemDTO[];
  currency: string;
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
}

export interface BackendHealthStatus {
  bookingService: boolean;
  paymentService: boolean;
}

/** Filters accepted by GET /api/v1/events (all optional). */
export interface EventFilters {
  q?: string;
  city?: string;
  category?: string;
  mode?: 'SEATED' | 'TIER';
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface EventListResponse {
  events: EventSummary[];
  total: number;
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
 * Session-carrying fetch. Wraps authFetch (which refreshes the access token
 * before/while it expires) and turns "the session is truly gone" into a clear
 * user-facing error instead of a bare 401.
 */
async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await authFetch(url, init);
  if (!response) {
    throw new Error('Sesi Anda kedaluwarsa. Silakan masuk ulang.');
  }
  return response;
}

/** GET with an optional session: discovery is public, some feeds are not. */
async function get(path: string, base: string, withAuth = false): Promise<Response> {
  try {
    return withAuth
      ? await authedFetch(`${base}${path}`)
      : await fetch(`${base}${path}`, { signal: AbortSignal.timeout(8000) });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Sesi')) throw err;
    throw new Error('Tidak dapat terhubung ke backend. Pastikan layanan berjalan.');
  }
}

/**
 * Calls catalog-service: GET /api/v1/events
 * Free-text search + location/category filters, newest first, paginated.
 */
export async function fetchEvents(filters: EventFilters = {}): Promise<EventListResponse> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.city) params.set('city', filters.city);
  if (filters.category) params.set('category', filters.category);
  if (filters.mode) params.set('mode', filters.mode);
  if (filters.createdBy) params.set('createdBy', filters.createdBy);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  const response = await get(`/events${query ? `?${query}` : ''}`, CATALOG_BASE_URL);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return { events: body.events ?? [], total: body.total ?? 0 };
}

/** Calls catalog-service: GET /api/v1/events/:id (detail view). */
export async function fetchEvent(eventId: string): Promise<EventSummary> {
  const response = await get(`/events/${eventId}`, CATALOG_BASE_URL);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as EventSummary;
}

/** Calls catalog-service: GET /api/v1/events/cities (location picker). */
export async function fetchCities(): Promise<CityEntry[]> {
  try {
    const response = await fetch(`${CATALOG_BASE_URL}/events/cities`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const body = await response.json();
    return body.cities ?? [];
  } catch {
    // Offline: the picker falls back to whatever cities are already known.
    return [];
  }
}

/**
 * Calls catalog-service: GET /api/v1/events/:id/seatmap
 * Returns SeatCategory[] where each seat carries a real UUID in seatId.
 */
export async function fetchSeatMap(eventId: string): Promise<SeatCategory[]> {
  const response = await get(`/events/${eventId}/seatmap`, CATALOG_BASE_URL);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.categories ?? [];
}

/**
 * Calls catalog-service: GET /api/v1/events/:id/ticket-types
 * Quota-based tiers with live remaining stock (TIER events).
 */
export async function fetchTicketTypes(eventId: string): Promise<TicketTypeList> {
  const response = await get(`/events/${eventId}/ticket-types`, CATALOG_BASE_URL);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as TicketTypeList;
}

/**
 * Calls catalog-service: POST /api/v1/events
 * Any signed-in user may publish an event (identity from the access token).
 */
export async function createEvent(payload: CreateEventPayload): Promise<EventSummary> {
  requireSession();

  const response = await authedFetch(`${CATALOG_BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as EventSummary;
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
 * Calls booking-service: POST /api/v1/reservations (SEATED events)
 * Requires a signed-in session: the call carries the access token and the
 * server derives the owner from it (userId in the body is ignored).
 */
export async function createReservation(
  selectedSeats: SelectedSeat[],
  eventId: string
): Promise<Reservation> {
  requireSession();

  const seatsPayload: SeatItemDTO[] = selectedSeats.map((s) => ({
    seatId: s.seatId ?? seatIdToUUID(s.id),
    section: s.categoryName,
    row: s.row ?? 'A',
    number: String(s.number ?? '01'),
    price: s.price,
  }));

  const requestBody: CreateReservationRequest = {
    eventId,
    mode: 'SEATED',
    seats: seatsPayload,
    currency: 'IDR',
  };

  const response = await authedFetch(`${BOOKING_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as Reservation;
}

/**
 * Calls booking-service: POST /api/v1/reservations (TIER events)
 * Only the tier ids and quantities are sent: prices and stock are resolved
 * server-side from catalog-service, and the quota is enforced under an
 * advisory lock, so the client can never oversell.
 */
export async function createTierReservation(
  tickets: SelectedTicket[],
  eventId: string
): Promise<Reservation> {
  requireSession();

  const itemsPayload: TicketItemDTO[] = tickets.map((t) => ({
    categoryId: t.categoryId,
    quantity: t.quantity,
  }));

  const requestBody: CreateReservationRequest = {
    eventId,
    mode: 'TIER',
    items: itemsPayload,
    currency: 'IDR',
  };

  const response = await authedFetch(`${BOOKING_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as Reservation;
}

/** Calls booking-service: GET /api/v1/reservations ("Tiket Saya"). */
export async function fetchReservations(): Promise<Reservation[]> {
  requireSession();

  const response = await get('/reservations', BOOKING_BASE_URL, true);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.reservations ?? [];
}

/**
 * Calls booking-service: POST /api/v1/reservations/:id/confirm
 */
export async function confirmReservation(reservationId: string): Promise<Reservation> {
  const response = await authedFetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as Reservation;
}

/**
 * Calls booking-service: POST /api/v1/reservations/:id/cancel
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  try {
    await authFetch(`${BOOKING_BASE_URL}/reservations/${reservationId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Best-effort cancel: ignore network errors
  }
}

/**
 * Calls payment-service: POST /api/v1/payments
 */
export async function createPayment(reservationId: string): Promise<PaymentResponse> {
  const response = await authedFetch(`${PAYMENT_BASE_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reservation_id: reservationId,
      payment_method: 'QRIS',
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as PaymentResponse;
}

/**
 * Calls payment-service: POST /api/v1/payments/:id/confirm
 */
export async function confirmPayment(paymentId: string): Promise<PaymentResponse> {
  const response = await authedFetch(`${PAYMENT_BASE_URL}/payments/${paymentId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as PaymentResponse;
}
