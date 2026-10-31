/**
 * @file seat_map_screen_types.ts
 * @description Type definitions for SeatMapScreen props.
 */
import { Seat } from '../../types/seat';
import { ScreenType } from '../../types/navigation';

export interface SeatMapScreenProps {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  onProceedToPayment?: () => void;
  seats?: Seat[];
  selectedSeats?: Seat[];
  onToggleSeat?: (seat: Seat) => void;
  onRemoveSeat?: (seatId: string) => void;
}
