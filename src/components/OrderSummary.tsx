/**
 * @file OrderSummary.tsx
 * @description Main OrderSummary component coordinating sidebar header, seats list, and pricing footer.
 */
import React, { useMemo, useCallback } from 'react';
import { useBooking } from '../context/BookingContext';
import { Seat } from '../types/seat';
import { calculateOrderPricing } from '../utils/format';
import {
  OrderSummaryProps, NormalizedSummarySeat, normalizeSummarySeats,
  renderOrderSummaryHeader, renderOrderSummarySeatList, renderOrderSummaryFooter
} from './order_summary/index';

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedSeats: propsSeats, onRemoveSeat, onProceedToPayment, lockTimerSeconds: propsTimer, isLoading = false
}) => {
  let bookingContext: ReturnType<typeof useBooking> | null = null;
  try { bookingContext = useBooking(); } catch { bookingContext = null; }

  const seats = useMemo(() => normalizeSummarySeats(propsSeats !== undefined ? propsSeats : (bookingContext?.selectedSeats || [])), [propsSeats, bookingContext?.selectedSeats]);
  const activeTimerSeconds = propsTimer !== undefined ? propsTimer : (bookingContext?.lockTimerSeconds ?? 300);
  const timerPercentage = Math.max(0, Math.min(100, (activeTimerSeconds / 300) * 100));
  const pricing = useMemo(() => calculateOrderPricing(seats.map((s) => s.price)), [seats]);

  const handleRemove = useCallback((item: NormalizedSummarySeat) => {
    if (onRemoveSeat) { onRemoveSeat(item.id); return; }
    if (!bookingContext) return;
    const match = bookingContext.selectedSeats.find((s) => s.id === item.id || s.key === item.id);
    if (match) { bookingContext.toggleSeat(match); } else if ('status' in item.raw) { bookingContext.toggleSeat(item.raw as Seat); }
  }, [onRemoveSeat, bookingContext]);

  const handleProceed = useCallback(() => {
    if (seats.length === 0 || isLoading) return;
    if (onProceedToPayment) { onProceedToPayment(); } else if (bookingContext) { bookingContext.openCheckout(); }
  }, [seats.length, isLoading, onProceedToPayment, bookingContext]);

  return (
    <aside className="order-summary-sidebar bg-canvas border-l border-line flex flex-col justify-between w-full h-full overflow-hidden">
      <div>
        {renderOrderSummaryHeader({ count: seats.length, activeTimerSeconds, timerPercentage })}
        {renderOrderSummarySeatList({ seats, onRemove: handleRemove })}
      </div>
      {renderOrderSummaryFooter({ pricing, disabled: seats.length === 0 || isLoading, isLoading, onProceed: handleProceed })}
    </aside>
  );
};

export default OrderSummary;
