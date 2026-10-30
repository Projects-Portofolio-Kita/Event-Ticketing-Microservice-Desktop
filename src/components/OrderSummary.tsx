import type { FC } from 'react';
import { ArrowRight, Trash2, Loader2, Armchair, Layers } from 'lucide-react';
import { OrderItem, SaleMode } from '../types/booking';

interface OrderSummaryProps {
  items: OrderItem[];
  /** Removes one line: a seat id or a tier (categoryId). */
  onRemove: (id: string) => void;
  onProceedToPayment: () => void;
  lockTimerSeconds: number;
  /** SEATED picks seats, TIER counts tickets — the wording follows that. */
  mode: SaleMode;
  isLoading?: boolean;
}

const formatRupiah = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

/** What this line costs: seats are 1 seat, tiers multiply by quantity. */
const lineTotal = (item: OrderItem): number =>
  item.kind === 'seat' ? item.price : item.price * item.quantity;

const lineLabel = (item: OrderItem): string =>
  item.kind === 'seat'
    ? item.seatLabel
    : `${item.quantity} × ${formatRupiah(item.price)}`;

export const OrderSummary: FC<OrderSummaryProps> = ({
  items,
  onRemove,
  onProceedToPayment,
  lockTimerSeconds,
  mode,
  isLoading = false,
}) => {
  // Format MM:SS for countdown timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Totals mirror what booking-service computes server-side (no extra fees),
  // so the number here is exactly what the payment will charge.
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  const seatCount = items.filter((item) => item.kind === 'seat').length;
  const ticketCount = items
    .filter((item) => item.kind === 'tier')
    .reduce((sum, item) => sum + (item.kind === 'tier' ? item.quantity : 0), 0);
  const pickedLabel =
    mode === 'TIER'
      ? `${ticketCount} tiket dipilih`
      : `${seatCount} kursi dipilih`;

  const timerPercentage = Math.max(0, Math.min(100, (lockTimerSeconds / 300) * 100));

  return (
    <aside className="order-summary-sidebar">
      {/* Header */}
      <div className="summary-header">
        <h2 className="summary-title">Ringkasan Pesanan</h2>
        <p className="summary-subtitle">{pickedLabel}</p>
      </div>

      {/* Lock Timer Card */}
      <div className="lock-timer-card">
        <div className="timer-info-row">
          <span className="timer-label">
            {mode === 'TIER' ? 'Sisa Waktu Lock Tiket' : 'Sisa Waktu Lock Kursi'}
          </span>
          <span className="timer-countdown">{formatTimer(lockTimerSeconds)}</span>
        </div>
        <div className="timer-progress-track">
          <div
            className="timer-progress-bar"
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Selected items or empty state */}
      <div className="summary-content">
        {items.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state-text">
              {mode === 'TIER'
                ? 'Pilih jenis tiket dan jumlahnya untuk mulai memesan.'
                : 'Pilih kursi yang tersedia pada denah untuk mulai memesan.'}
            </p>
          </div>
        ) : (
          <div className="selected-seats-list">
            {items.map((item) => (
              <div key={item.id} className="selected-seat-item">
                <div className="item-info">
                  <div className="item-header">
                    <span className="item-category-tag">
                      {item.kind === 'seat' ? (
                        <Armchair size={11} />
                      ) : (
                        <Layers size={11} />
                      )}
                      {item.categoryName}
                    </span>
                    <span className="item-seat-label">{lineLabel(item)}</span>
                  </div>
                  <span className="item-subtitle">{item.subtitle}</span>
                  <span className="item-price">{formatRupiah(lineTotal(item))}</span>
                </div>
                <button
                  className="remove-seat-btn"
                  onClick={() => onRemove(item.id)}
                  title="Hapus dari pesanan"
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
          className={`checkout-btn ${items.length === 0 || isLoading ? 'disabled' : 'active'}`}
          disabled={items.length === 0 || isLoading}
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

export default OrderSummary;
