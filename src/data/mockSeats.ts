/**
 * @file mockSeats.ts
 * @description Full 270 seats generation across 4 tiers with deterministic status.
 */

import { Seat, SeatTier, SeatStatus, StadiumSeat } from '../types/seat';
import { mockSeatTiers, ROWS_LETTERS } from './mock_seat_tiers';
export * from './mock_seat_tiers';
export * from './mock_legacy_categories';

export function generateStadiumSeats(): StadiumSeat[] {
  const seats: StadiumSeat[] = [];
  for (const tier of mockSeatTiers) {
    for (let r = 0; r < tier.rows; r++) {
      for (let c = 1; c <= tier.cols; c++) {
        const hash = (tier.id.charCodeAt(3) * 31 + r * 7 + c * 13) % 100;
        const status: SeatStatus = hash < 22 ? 'sold' : hash < 30 ? 'locked' : 'available';
        seats.push({
          key: `${tier.id}-${ROWS_LETTERS[r]}-${c}`,
          section: tier, row: ROWS_LETTERS[r], num: c, status,
        });
      }
    }
  }
  return seats;
}

export const Ht = generateStadiumSeats;
export const formatRupiah = (value: number): string => `Rp ${value.toLocaleString('id-ID')}`;
export const Ut = formatRupiah;

export function getMockSeats(): Seat[] {
  const tierMap: Record<string, SeatTier> = { CAT1: 'cat1', CAT2: 'cat2', CAT3: 'cat3', CAT4: 'cat4' };
  return generateStadiumSeats().map((s) => ({
    id: s.key, key: s.key, row: s.row, number: s.num,
    tier: tierMap[s.section.id] || 'cat1', tierName: s.section.name,
    price: s.section.price, status: s.status, category: s.section.name,
    label: `${s.section.name} VIP - Row ${s.row}, Seat ${s.num}`,
  }));
}

export const mockSeats: Seat[] = getMockSeats();
export const mockStadiumSeats: StadiumSeat[] = generateStadiumSeats();
