/**
 * @file seat_map_types.ts
 * @description Type definitions for SeatMap props and category compatibility.
 */
import { Seat } from '../../types/seat';
import { SeatCategory } from '../../types/booking';

export interface SeatMapProps {
  seats?: Seat[];
  selectedSeatIds?: string[];
  onToggleSeat?: (...args: any[]) => void;
  onSeatAlert?: (msg: string) => void;
  onBack?: () => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showBanner?: boolean;
  categories?: SeatCategory[];
}
