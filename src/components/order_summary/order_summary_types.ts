/**
 * @file order_summary_types.ts
 * @description Type definitions for OrderSummary props and normalized seat representations.
 */
import { Seat } from '../../types/seat';
import { SelectedSeat } from '../../types/booking';

export interface OrderSummaryProps {
  selectedSeats?: (Seat | SelectedSeat)[];
  onRemoveSeat?: (seatId: string) => void;
  onProceedToPayment?: () => void;
  lockTimerSeconds?: number;
  isLoading?: boolean;
}

export interface NormalizedSummarySeat {
  id: string;
  seatCode: string;
  tierName: string;
  price: number;
  raw: Seat | SelectedSeat;
}
