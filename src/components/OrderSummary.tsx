/**
 * OrderSummary Component for TickId Desktop Application
 * Matches reverse-engineered Figma host app specifications
 * Features:
 *  - Dynamic sidebar integrating with BookingContext and standalone props fallback
 *  - 5-minute lock countdown timer with animated progress bar
 *  - List of selected seats showing seat code (e.g. "C1-A-01"), tier name, price in IDR, and remove (X) button
 *  - Empty state placeholder if 0 seats selected ("Pilih kursi yang tersedia pada denah untuk mulai memesan.")
 *  - Real-time subtotal calculation
 *  - 10% entertainment tax (Math.round(subtotal * 0.1))
 *  - Service fee: fixed Rp 35.000 when >=1 seat selected; Rp 0 when 0 seats
 *  - Total price calculation (subtotal + tax + serviceFee)
 *  - Primary CTA "Lanjut ke Pembayaran QRIS": disabled when 0 seats selected; calls openCheckout()
 *  - Backward compatibility with legacy App.tsx props
 */

import React, { useMemo, useCallback } from 'react';
import {
  X,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { Seat } from '../types/seat';
import { SelectedSeat } from '../types/booking';
import { formatRupiah, formatTimer, calculateOrderPricing } from '../utils/format';

export interface OrderSummaryProps {
  selectedSeats?: (Seat | SelectedSeat)[];
  onRemoveSeat?: (seatId: string) => void;
  onProceedToPayment?: () => void;
  lockTimerSeconds?: number;
  isLoading?: boolean;
}

interface NormalizedSummarySeat {
  id: string;
  seatCode: string;
  tierName: string;
  price: number;
  raw: Seat | SelectedSeat;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedSeats: propsSeats,
  onRemoveSeat,
  onProceedToPayment,
  lockTimerSeconds: propsTimer,
  isLoading = false
}) => {
  // Graceful BookingContext consumption with fallback
  let bookingContext: ReturnType<typeof useBooking> | null = null;
  try {
    bookingContext = useBooking();
  } catch {
    bookingContext = null;
  }

  // Normalize selected seats from props or BookingContext
  const normalizedSeats = useMemo<NormalizedSummarySeat[]>(() => {
    const rawSeats = propsSeats !== undefined ? propsSeats : (bookingContext?.selectedSeats || []);

    return rawSeats.map((s) => {
      // Legacy SelectedSeat object format
      if ('seatLabel' in s && 'categoryName' in s) {
        return {
          id: s.id,
          seatCode: s.id,
          tierName: s.categoryName,
          price: s.price,
          raw: s
        };
      }

      // Domain Seat object format
      const tierPrefix =
        s.tier === 'cat1'
          ? 'C1'
          : s.tier === 'cat2'
          ? 'C2'
          : s.tier === 'cat3'
          ? 'C3'
          : 'C4';
      const numFormatted = String(s.number).padStart(2, '0');
      const formattedCode = `${tierPrefix}-${s.row}-${numFormatted}`;

      return {
        id: s.id,
        seatCode: formattedCode,
        tierName: s.tierName || `CAT ${s.tier?.replace('cat', '')} VIP`,
        price: s.price,
        raw: s
      };
    });
  }, [propsSeats, bookingContext?.selectedSeats]);

  // Lock timer handling
  const activeTimerSeconds =
    propsTimer !== undefined
      ? propsTimer
      : (bookingContext?.lockTimerSeconds ?? 300);

  const timerPercentage = Math.max(0, Math.min(100, (activeTimerSeconds / 300) * 100));

  // Domain pricing calculation: subtotal, 10% entertainment tax, Rp 35k fee if >= 1 seat, total
  const pricing = useMemo(() => {
    return calculateOrderPricing(normalizedSeats.map((s) => s.price));
  }, [normalizedSeats]);

  const { subtotal, tax, serviceFee, total } = pricing;

  // Handle seat removal
  const handleRemove = useCallback(
    (item: NormalizedSummarySeat) => {
      if (onRemoveSeat) {
        onRemoveSeat(item.id);
      } else if (bookingContext) {
        const domainSeat = bookingContext.selectedSeats.find(
          (s) => s.id === item.id || s.key === item.id
        );
        if (domainSeat) {
          bookingContext.toggleSeat(domainSeat);
        } else if ('status' in item.raw) {
          bookingContext.toggleSeat(item.raw as Seat);
        }
      }
    },
    [onRemoveSeat, bookingContext]
  );

  // Handle proceed to payment
  const handleProceed = useCallback(() => {
    if (normalizedSeats.length === 0 || isLoading) return;

    if (onProceedToPayment) {
      onProceedToPayment();
    } else if (bookingContext) {
      bookingContext.openCheckout();
    }
  }, [normalizedSeats.length, isLoading, onProceedToPayment, bookingContext]);

  return (
    <aside className="order-summary-sidebar bg-canvas border-l border-line flex flex-col justify-between w-full h-full overflow-hidden">
      {/* Header */}
      <div>
        <div className="summary-header p-5 border-b border-line">
          <h2 className="summary-title font-display font-bold text-[16px] text-ink">
            Ringkasan Pesanan
          </h2>
          <p className="summary-subtitle text-[12px] text-ink-soft">
            {normalizedSeats.length} kursi dipilih
          </p>
        </div>

        {/* 5-Minute Seat Lock Timer Card */}
        <div className="lock-timer-card m-4 rounded-xl bg-amber/10 border border-amber/30 p-4">
          <div className="timer-info-row flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-ink-soft">Sisa Waktu Lock Kursi</span>
            <span className="timer-countdown font-mono text-[16px] font-semibold text-amber">
              {formatTimer(activeTimerSeconds)}
            </span>
          </div>
          {/* Animated Progress Track */}
          <div className="timer-progress-track w-full bg-amber/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="timer-progress-bar bg-amber h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>

        {/* Selected Seats List or Empty State */}
        <div className="selected-seats-container px-4 overflow-auto max-h-[calc(100vh-420px)]">
          {normalizedSeats.length === 0 ? (
            <div className="empty-state-placeholder py-12 px-6 text-center">
              <p className="empty-state-text text-[13px] text-ink-muted">
                Pilih kursi yang tersedia pada denah untuk mulai memesan.
              </p>
            </div>
          ) : (
            <div className="selected-seats-list space-y-2">
              {normalizedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="selected-seat-item flex items-center justify-between bg-panel border border-line rounded-lg px-3 py-2.5"
                >
                  <div className="item-info">
                    <p className="seat-code-tag text-[12px] font-medium text-ink">
                      {seat.tierName} - {seat.seatCode}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="item-price font-mono text-[12px] text-ink-soft">
                      {formatRupiah(seat.price)}
                    </span>
                    <button
                      onClick={() => handleRemove(seat)}
                      className="remove-seat-btn text-ink-muted hover:text-danger p-0.5 rounded cursor-pointer transition-colors"
                      aria-label={`Hapus kursi ${seat.seatCode}`}
                      title="Hapus kursi"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Breakdown & Checkout Action */}
      <div className="summary-footer p-5 border-t border-line space-y-2 mt-auto">
        <div className="pricing-breakdown space-y-2 text-[13px]">
          <div className="price-row flex items-center justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span className="font-mono text-ink">{formatRupiah(subtotal)}</span>
          </div>

          <div className="price-row flex items-center justify-between">
            <span className="text-ink-muted">Pajak Hiburan (10%)</span>
            <span className="font-mono text-ink">{formatRupiah(tax)}</span>
          </div>

          <div className="price-row flex items-center justify-between">
            <span className="text-ink-muted">Biaya Layanan</span>
            <span className="font-mono text-ink">{formatRupiah(serviceFee)}</span>
          </div>

          <div className="h-px bg-line my-1" />

          <div className="total-row flex items-center justify-between pt-1">
            <span className="text-[13px] font-semibold text-ink">Total</span>
            <span className="total-val font-display text-[18px] font-bold text-ink">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Checkout Button CTA */}
        <button
          onClick={handleProceed}
          disabled={normalizedSeats.length === 0 || isLoading}
          className={`checkout-btn w-full h-12 mt-2 grad-brand text-white font-semibold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-all ${
            normalizedSeats.length === 0 || isLoading
              ? 'opacity-40 cursor-not-allowed'
              : 'shadow-brand hover:brightness-110 cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Lanjut ke Pembayaran QRIS</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default OrderSummary;
