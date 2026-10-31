/**
 * @file eticket_types.ts
 * @description Type definitions for ETicketScreen props.
 */
import { ETicketData } from '../../types/ticket';
import { Seat } from '../../types/seat';
import { ScreenType } from '../../types/navigation';

export interface ETicketScreenProps {
  onNavigate?: (screen: ScreenType) => void;
  ticketData?: ETicketData;
  selectedSeats?: Seat[];
}
