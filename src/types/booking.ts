export type SeatStatus = 'available' | 'selected' | 'locked' | 'sold';

export interface Seat {
  id: string; // e.g. "CAT3-A-01"
  seatId?: string; // real UUID from catalog-service
  row: string;
  number: number;
  status: SeatStatus;
  category: string;
  price: number;
}

export interface SeatCategory {
  id: string;
  name: string;
  subtitle: string;
  dotColor: string;
  price: number;
  rows: {
    rowName: string;
    leftSeats: Seat[];
    rightSeats: Seat[];
  }[];
}

/** One chosen seat of a SEATED event. */
export interface SelectedSeat {
  kind: 'seat';
  id: string;
  seatId?: string; // real UUID from catalog-service
  categoryName: string;
  subtitle: string;
  seatLabel: string;
  row?: string;
  number?: number;
  price: number;
}

/** One chosen ticket tier with its quantity, for a TIER event. */
export interface SelectedTicket {
  kind: 'tier';
  id: string; // categoryId
  categoryId: string;
  categoryName: string;
  subtitle: string;
  price: number;
  quantity: number;
}

/** The order sidebar and the payment modal both render either kind. */
export type OrderItem = SelectedSeat | SelectedTicket;

/* --- Discovery (catalog-service) ----------------------------------------- */

export type SaleMode = 'SEATED' | 'TIER';

export interface EventSummary {
  id: string;
  code: string;
  name: string;
  venue: string;
  eventDate: string;
  city: string;
  category: string;
  saleMode: SaleMode;
  description?: string;
  posterUrl?: string;
  minPrice: number;
  ticketTypeCount: number;
  createdBy?: string;
}

export interface CityEntry {
  city: string;
  count: number;
}

/** One quota-based ticket tier with live availability. */
export interface TicketType {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  quota: number;
  remaining: number;
}

export interface TicketTypeList {
  saleMode: SaleMode;
  ticketTypes: TicketType[];
}

/* --- Create event payload ------------------------------------------------ */

export interface CreateEventCategory {
  name: string;
  price: number;
  quota?: number;
  description?: string;
}

export interface CreateEventPayload {
  code?: string;
  name: string;
  venue: string;
  eventDate: string; // "2027-03-05T09:00:00+07:00" or "2027-03-05"
  city?: string;
  category?: string;
  description?: string;
  posterUrl?: string;
  saleMode?: SaleMode;
  seatRows?: number;
  seatsPerRow?: number;
  leftBlockSize?: number;
  payoutBankName?: string;
  payoutAccountNumber?: string;
  payoutAccountName?: string;
  categories: CreateEventCategory[];
}

/* --- Booking history (booking-service) ----------------------------------- */
export interface ReservationItem {
  categoryId: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ReservationSeatItem {
  seatId: string;
  section: string;
  row: string;
  number: string;
  price: number;
}

export interface Reservation {
  reservationId: string;
  userId: string;
  eventId: string;
  bookingRef: string;
  status: 'LOCKED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  mode: SaleMode;
  expiresAt: string;
  totalAmount: number;
  currency: string;
  seats: ReservationSeatItem[];
  items: ReservationItem[];
  createdAt: string;
}

/** Discovery filters shared between the navbar and the discover page. */
export interface DiscoveryFilters {
  q: string;
  city: string;
  category: string;
}
