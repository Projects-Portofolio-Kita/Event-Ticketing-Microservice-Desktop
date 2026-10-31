/**
 * @file use_seat_map_state.ts
 * @description Hook managing seat selection set, grouping by tier, and click dispatching.
 */
import { useMemo, useCallback } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useNavigation } from '../../context/NavigationContext';
import { Seat, SeatTier } from '../../types/seat';
import { SeatMapProps } from './seat_map_types';

export function useSeatMapState(props: SeatMapProps, defaultSeats: Seat[]) {
  let booking: ReturnType<typeof useBooking> | null = null;
  try { booking = useBooking(); } catch { booking = null; }
  let nav: ReturnType<typeof useNavigation> | null = null;
  try { nav = useNavigation(); } catch { nav = null; }

  const seats = props.seats || defaultSeats;
  const activeSelectedIds = useMemo(() => {
    if (props.selectedSeatIds) return new Set(props.selectedSeatIds);
    if (booking) return new Set(booking.selectedSeats.map((s) => s.id || s.key || ''));
    return new Set<string>();
  }, [props.selectedSeatIds, booking]);

  const seatsByTier = useMemo(() => {
    const map: Record<SeatTier, Seat[]> = { cat1: [], cat2: [], cat3: [], cat4: [] };
    seats.forEach((s) => { if (map[s.tier]) map[s.tier].push(s); else map.cat1.push(s); });
    return map;
  }, [seats]);

  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.status === 'locked') {
      props.onSeatAlert?.(`Kursi ${seat.row}${seat.number} (${seat.tierName}) sedang di-lock penonton lain.`);
      return;
    }
    if (seat.status === 'sold') {
      props.onSeatAlert?.(`Kursi ${seat.row}${seat.number} (${seat.tierName}) sudah terjual.`);
      return;
    }
    if (props.onToggleSeat) props.onToggleSeat(seat, seat.tierName, seat.label || '');
    else booking?.toggleSeat(seat);
  }, [props.onToggleSeat, props.onSeatAlert, booking]);

  const handleBack = useCallback(() => {
    if (props.onBack) props.onBack(); else nav?.navigateTo('detail');
  }, [props.onBack, nav]);

  return { activeSelectedIds, seatsByTier, handleSeatClick, handleBack };
}
