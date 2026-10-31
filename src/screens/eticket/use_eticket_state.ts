/**
 * @file use_eticket_state.ts
 * @description Hook managing toast messages, navigation fallback, and seat labels for ETicketScreen.
 */
import { useState, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useBooking } from '../../context/BookingContext';
import { generateBarcodeBars } from '../../utils/format';
import { Seat } from '../../types/seat';
import { ScreenType } from '../../types/navigation';

export function useETicketState(onNavigate?: (screen: ScreenType) => void, propSeats?: Seat[]) {
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try { navContext = useNavigation(); } catch { navContext = null; }
  let bookingContext: ReturnType<typeof useBooking> | null = null;
  try { bookingContext = useBooking(); } catch { bookingContext = null; }

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };
  const handleHome = () => { if (onNavigate) onNavigate('discover'); else navContext?.navigateTo('discover'); };

  const seats = propSeats || bookingContext?.selectedSeats || [];
  const tierName = seats.length > 0 ? (seats[0].tierName || 'CAT 1 — VIP') : 'CAT 1 — VIP';
  const seatsListString = seats.length > 0 ? seats.map((s) => s.key || s.id).join(', ') : 'ROW C · NO 14 & 15';
  const barcodeBars = useMemo(() => generateBarcodeBars(58), []);

  return { toastMsg, showToast, handleHome, tierName, seatsListString, barcodeBars };
}
