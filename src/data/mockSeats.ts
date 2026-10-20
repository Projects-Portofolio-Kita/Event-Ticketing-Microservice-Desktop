/**
 * Mock Seats Data for TickId Desktop Application
 * Full 270 seats across 4 tiers with deterministic status algorithm
 * Reverse-engineered from https://mop-lion-37118726.figma.site
 */

import { Seat, SeatTier, SeatStatus, StadiumSection, StadiumSeat } from '../types/seat';
import { SeatCategory } from '../types/booking';

export const ROWS_LETTERS = 'ABCDEFGHIJKLMNOP';

/**
 * 4 Stadium Seat Tiers matching reference design specifications:
 * - CAT 1 VIP Soundcheck: Rp 3.500.000 (3 rows x 18 cols = 54 seats)
 * - CAT 2 Festival / Free Standing: Rp 2.100.000 (also supporting Rp 2.200.000) (4 rows x 18 cols = 72 seats)
 * - CAT 3 Tribun Bawah: Rp 1.500.000 (4 rows x 18 cols = 72 seats)
 * - CAT 4 Tribun Atas: Rp 750.000 (4 rows x 18 cols = 72 seats)
 * Total: 270 seats
 */
export const mockSeatTiers: StadiumSection[] = [
  {
    id: 'CAT1',
    name: 'CAT 1',
    sub: 'VIP Soundcheck',
    price: 3500000,
    priceLabel: 'Rp 3.500.000',
    color: '#7c3aed',
    rows: 3,
    cols: 18
  },
  {
    id: 'CAT2',
    name: 'CAT 2',
    sub: 'Festival / Free Standing',
    price: 2100000, // Rp 2.100.000 (reference bundle standard; variant Rp 2.200.000)
    priceLabel: 'Rp 2.100.000',
    color: '#4f46e5',
    rows: 4,
    cols: 18
  },
  {
    id: 'CAT3',
    name: 'CAT 3',
    sub: 'Tribun Bawah',
    price: 1500000,
    priceLabel: 'Rp 1.500.000',
    color: '#06b6d4',
    rows: 4,
    cols: 18
  },
  {
    id: 'CAT4',
    name: 'CAT 4',
    sub: 'Tribun Atas',
    price: 750000,
    priceLabel: 'Rp 750.000',
    color: '#64748b',
    rows: 4,
    cols: 18
  }
];

// Reference alias
export const Bt = mockSeatTiers;
export const Vt = ROWS_LETTERS;

/**
 * Deterministic pseudo-random status allocation:
 * hash = (tier.id.charCodeAt(3) * 31 + rowIndex * 7 + colNum * 13) % 100
 * if hash < 22 -> sold
 * else if hash < 30 -> locked
 * else -> available
 */
export function generateStadiumSeats(): StadiumSeat[] {
  const seats: StadiumSeat[] = [];
  for (const tier of mockSeatTiers) {
    for (let r = 0; r < tier.rows; r++) {
      for (let c = 1; c <= tier.cols; c++) {
        const hash = (tier.id.charCodeAt(3) * 31 + r * 7 + c * 13) % 100;
        let status: SeatStatus = 'available';
        if (hash < 22) {
          status = 'sold';
        } else if (hash < 30) {
          status = 'locked';
        }
        seats.push({
          key: `${tier.id}-${ROWS_LETTERS[r]}-${c}`,
          section: tier,
          row: ROWS_LETTERS[r],
          num: c,
          status
        });
      }
    }
  }
  return seats;
}

// Reference alias
export const Ht = generateStadiumSeats;

export const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID')}`;

// Reference alias
export const Ut = formatRupiah;

export function getMockSeats(): Seat[] {
  return generateStadiumSeats().map(s => {
    const tierMap: Record<string, SeatTier> = {
      CAT1: 'cat1',
      CAT2: 'cat2',
      CAT3: 'cat3',
      CAT4: 'cat4'
    };
    return {
      id: s.key,
      key: s.key,
      row: s.row,
      number: s.num,
      tier: tierMap[s.section.id] || 'cat1',
      tierName: s.section.name,
      price: s.section.price,
      status: s.status,
      category: s.section.name,
      label: `${s.section.name} VIP - Row ${s.row}, Seat ${s.num}`
    };
  });
}

export const mockSeats: Seat[] = getMockSeats();
export const mockStadiumSeats: StadiumSeat[] = generateStadiumSeats();

/* ==========================================================================
   Backward Compatibility Export for Legacy App.tsx Consumers
   ========================================================================== */
export const initialCategories: SeatCategory[] = [
  {
    id: 'cat-1',
    name: 'CAT 1',
    subtitle: 'VIP Soundcheck',
    dotColor: '#7c3aed',
    price: 3500000,
    rows: [
      {
        rowName: 'A',
        leftSeats: Array.from({ length: 9 }).map((_, i) => ({
          id: `C1-A0${i + 1}`,
          row: 'A',
          number: i + 1,
          status: i === 3 ? 'sold' : 'available',
          category: 'CAT 1',
          price: 3500000
        })),
        rightSeats: Array.from({ length: 9 }).map((_, i) => ({
          id: `C1-A${i + 10}`,
          row: 'A',
          number: i + 10,
          status: i === 2 ? 'sold' : i === 5 ? 'locked' : 'available',
          category: 'CAT 1',
          price: 3500000
        }))
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'CAT 2',
    subtitle: 'Festival Free Standing',
    dotColor: '#10b981',
    price: 2100000,
    rows: [
      {
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
      }
    ]
  }
];
