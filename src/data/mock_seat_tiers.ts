/**
 * @file mock_seat_tiers.ts
 * @description Stadium seat tiers, letters, and color schemes.
 */

import { StadiumSection } from '../types/seat';

export const ROWS_LETTERS = 'ABCDEFGHIJKLMNOP';

export const mockSeatTiers: StadiumSection[] = [
  { id: 'CAT1', name: 'CAT 1', sub: 'VIP Soundcheck', price: 3500000, priceLabel: 'Rp 3.500.000', color: '#7c3aed', rows: 3, cols: 18 },
  { id: 'CAT2', name: 'CAT 2', sub: 'Festival / Free Standing', price: 2100000, priceLabel: 'Rp 2.100.000', color: '#4f46e5', rows: 4, cols: 18 },
  { id: 'CAT3', name: 'CAT 3', sub: 'Tribun Bawah', price: 1500000, priceLabel: 'Rp 1.500.000', color: '#06b6d4', rows: 4, cols: 18 },
  { id: 'CAT4', name: 'CAT 4', sub: 'Tribun Atas', price: 750000, priceLabel: 'Rp 750.000', color: '#64748b', rows: 4, cols: 18 }
];

export const Bt = mockSeatTiers;
export const Vt = ROWS_LETTERS;
