/**
 * @file api_types.ts
 * @description DTO definitions for backend Go microservice integrations.
 */

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
  seats: SeatItemDTO[];
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
  bookingService: boolean; paymentService: boolean;
}