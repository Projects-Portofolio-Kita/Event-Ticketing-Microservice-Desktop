/**
 * @file mock_legacy_categories.ts
 * @description Backward compatibility mock categories for legacy consumers.
 */

import { SeatCategory } from '../types/booking';

export const initialCategories: SeatCategory[] = [
  {
    id: 'cat-1', name: 'CAT 1', subtitle: 'VIP Soundcheck', dotColor: '#7c3aed', price: 3500000,
    rows: [{
      rowName: 'A',
      leftSeats: Array.from({ length: 9 }).map((_, i) => ({
        id: `C1-A0${i + 1}`, row: 'A', number: i + 1, status: i === 3 ? 'sold' : 'available', category: 'CAT 1', price: 3500000
      })),
      rightSeats: Array.from({ length: 9 }).map((_, i) => ({
        id: `C1-A${i + 10}`, row: 'A', number: i + 10, status: i === 2 ? 'sold' : i === 5 ? 'locked' : 'available', category: 'CAT 1', price: 3500000
      }))
    }]
  },
  {
    id: 'cat-2', name: 'CAT 2', subtitle: 'Festival Free Standing', dotColor: '#10b981', price: 2100000,
    rows: [{
      rowName: 'A',
      leftSeats: [
        { id: 'C2-A01', row: 'A', number: 1, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A02', row: 'A', number: 2, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A03', row: 'A', number: 3, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A04', row: 'A', number: 4, status: 'sold', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A05', row: 'A', number: 5, status: 'sold', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A06', row: 'A', number: 6, status: 'locked', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A07', row: 'A', number: 7, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A08', row: 'A', number: 8, status: 'available', category: 'CAT 2', price: 2100000 }
      ],
      rightSeats: [
        { id: 'C2-A09', row: 'A', number: 9, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A10', row: 'A', number: 10, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A11', row: 'A', number: 11, status: 'sold', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A12', row: 'A', number: 12, status: 'sold', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A13', row: 'A', number: 13, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A14', row: 'A', number: 14, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A15', row: 'A', number: 15, status: 'available', category: 'CAT 2', price: 2100000 },
        { id: 'C2-A16', row: 'A', number: 16, status: 'available', category: 'CAT 2', price: 2100000 }
      ]
    }]
  }
];
