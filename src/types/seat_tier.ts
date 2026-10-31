/**
 * @file seat_tier.ts
 * @description Seat tier definitions and stadium layout structures.
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
