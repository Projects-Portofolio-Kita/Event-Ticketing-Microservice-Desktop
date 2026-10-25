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

export interface SelectedSeat {
  id: string;
  seatId?: string; // real UUID from catalog-service
  categoryName: string;
  subtitle: string;
  seatLabel: string;
  row?: string;
  number?: number;
  price: number;
}
