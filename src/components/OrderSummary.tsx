import type { FC } from 'react';
import { ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { SelectedSeat } from '../types/booking';

interface OrderSummaryProps {
  selectedSeats: SelectedSeat[];
  onRemoveSeat: (seatId: string) => void;
  onProceedToPayment: () => void;
  lockTimerSeconds: number;
  isLoading?: boolean;
}

export const OrderSummary: FC<OrderSummaryProps> = ({
  selectedSeats,
  onRemoveSeat,
  onProceedToPayment,
  lockTimerSeconds,
  isLoading = false,
}) => {
  // Format MM:SS for countdown timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const tax = Math.round(subtotal * 0.1); // 10% Pajak Hiburan
  const serviceFee = 0; // Biaya Layanan Rp 0
  const total = subtotal + tax + serviceFee;

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const timerPercentage = Math.max(0, Math.min(100, (lockTimerSeconds / 300) * 100));

  return (
    <aside className="order-summary-sidebar">
      {/* Header */}
      <div className="summary-header">
        <h2 className="summary-title">Ringkasan Pesanan</h2>
        <p className="summary-subtitle">{selectedSeats.length} kursi dipilih</p>
      </div>

      {/* Lock Timer Card */}
      <div className="lock-timer-card">
        <div className="timer-info-row">
          <span className="timer-label">Sisa Waktu Lock Kursi</span>
          <span className="timer-countdown">{formatTimer(lockTimerSeconds)}</span>
        </div>
        <div className="timer-progress-track">
          <div
            className="timer-progress-bar"
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Selected Items or Empty State */}
      <div className="summary-content">
        {selectedSeats.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state-text">
              Pilih kursi yang tersedia pada denah untuk mulai memesan.
            </p>
          </div>
        ) : (
          <div className="selected-seats-list">
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="selected-seat-item">
                <div className="item-info">
                  <div className="item-header">
                    <span className="item-category-tag">{seat.categoryName}</span>
                    <span className="item-seat-label">{seat.seatLabel}</span>
                  </div>
                  <span className="item-subtitle">{seat.subtitle}</span>
                  <span className="item-price">{formatRupiah(seat.price)}</span>
                </div>
                <button
                  className="remove-seat-btn"
                  onClick={() => onRemoveSeat(seat.id)}
                  title="Hapus kursi"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing Breakdown & Checkout Action */}
      <div className="summary-footer">
        <div className="pricing-rows">
          <div className="price-row">
            <span className="price-label">Subtotal</span>
            <span className="price-val">{formatRupiah(subtotal)}</span>
          </div>
          <div className="price-row">
            <span className="price-label">Pajak Hiburan (10%)</span>
            <span className="price-val">{formatRupiah(tax)}</span>
          </div>
          <div className="price-row">
            <span className="price-label">Biaya Layanan</span>
            <span className="price-val">{formatRupiah(serviceFee)}</span>
          </div>
        </div>

        <div className="summary-divider" />

        <div className="total-row">
          <span className="total-label">Total</span>
          <span className="total-val">{formatRupiah(total)}</span>
        </div>

        <button
          className={`checkout-btn ${selectedSeats.length === 0 || isLoading ? 'disabled' : 'active'}`}
          disabled={selectedSeats.length === 0 || isLoading}
          onClick={onProceedToPayment}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Menghubungi Backend...</span>
            </>
          ) : (
            <>
              <span>Lanjut ke Pembayaran QRIS</span>
              <ArrowRight size={18} className="checkout-arrow" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
