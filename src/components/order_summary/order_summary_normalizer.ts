/**
 * @file order_summary_normalizer.ts
 * @description Helper function to normalize raw domain or legacy seats for OrderSummary.
 */
import { Seat } from '../../types/seat';
import { SelectedSeat } from '../../types/booking';
import { NormalizedSummarySeat } from './order_summary_types';

export function normalizeSummarySeats(rawSeats: (Seat | SelectedSeat)[]): NormalizedSummarySeat[] {
  return rawSeats.map((s) => {
    if ('seatLabel' in s && 'categoryName' in s) {
      return { id: s.id, seatCode: s.id, tierName: s.categoryName, price: s.price, raw: s };
    }
    const prefix = s.tier === 'cat1' ? 'C1' : s.tier === 'cat2' ? 'C2' : s.tier === 'cat3' ? 'C3' : 'C4';
    const numFormatted = String(s.number).padStart(2, '0');
    return {
      id: s.id,
      seatCode: `${prefix}-${s.row}-${numFormatted}`,
      tierName: s.tierName || `CAT ${s.tier?.replace('cat', '')} VIP`,
      price: s.price,
      raw: s
    };
  });
}
