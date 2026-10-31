/**
 * @file seat.ts
 * @description Core Seat model and BookingContextType contracts for TickId.
 */

import { SeatTier, SeatStatus } from './seat_tier';
export * from './seat_tier';

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
