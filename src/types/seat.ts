/**
 * Seat and Booking Domain Types for TickId Desktop Application
 */

export type SeatTier = 'cat1' | 'cat2' | 'cat3' | 'cat4';
export type SeatStatus = 'available' | 'selected' | 'locked' | 'sold';

export interface StadiumSection {
  id: string;
  name: string;
  sub: string;
  price: number;
  priceLabel: string;
  color: string;
  rows: number;
  cols: number;
}

export interface StadiumSeat {
  key: string;
  section: StadiumSection;
  row: string;
  num: number;
  status: SeatStatus;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  tier: SeatTier;
  tierName: string;
  price: number;
  status: SeatStatus;
  key?: string;
  label?: string;
  category?: string;
}

export interface SelectedSeatSummary {
  key: string;
  label: string;
  section: string;
  price: number;
  priceLabel: string;
}

export interface BookingContextType {
  selectedSeats: Seat[];
  toggleSeat: (seat: Seat) => void;
  clearSelection: () => void;
  lockTimerSeconds: number;
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  completePayment: () => void;
}
