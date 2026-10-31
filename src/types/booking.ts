/**
 * @file booking.ts
 * @description Types for seat categories, statuses, and seat selections.
 */
export type SeatStatus = 'available' | 'selected' | 'locked' | 'sold';

export interface Seat {
  id: string;
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

export interface SelectedSeat {
  id: string;
  categoryName: string;
  subtitle: string;
  seatLabel: string;
  price: number;
}
