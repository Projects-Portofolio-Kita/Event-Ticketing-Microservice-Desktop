import { useEffect, useState, type FC } from 'react';
import { X, CheckCircle, QrCode, ShieldCheck, Download, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { OrderItem } from '../types/booking';
import { createPayment, confirmReservation, confirmPayment, PaymentResponse } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Seats and/or tier lines currently in the basket. */
  items: OrderItem[];
  eventName?: string;
  reservationId: string | null;
  bookingRef: string | null;
  onPaymentSuccess: () => void;
}

const formatRupiah = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

const lineTotal = (item: OrderItem): number =>
  item.kind === 'seat' ? item.price : item.price * item.quantity;

const itemCount = (item: OrderItem): number => (item.kind === 'seat' ? 1 : item.quantity);

const lineLabel = (item: OrderItem): string =>
  item.kind === 'seat'
    ? `${item.categoryName} - ${item.seatLabel}`
    : `${item.categoryName} × ${item.quantity}`;

export const PaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  items,
  eventName,
  reservationId,
  bookingRef,
  onPaymentSuccess,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  // Failure of the QRIS session: shown inline, with a retry, instead of being
  // swallowed by console.error (the user previously saw nothing at all).
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // Snapshot the basket while it is still open: the parent clears its
  // selection on success, but the receipt must keep showing what was bought.
  const [orderSnapshot, setOrderSnapshot] = useState<OrderItem[]>([]);

  const total = orderSnapshot.reduce((sum, item) => sum + lineTotal(item), 0);
  const totalTickets = orderSnapshot.reduce((sum, item) => sum + itemCount(item), 0);

  // Request payment from backend when modal opens
  const requestPayment = () => {
    if (!reservationId) return;
    setIsLoading(true);
    setPaymentError(null);
    createPayment(reservationId)
      .then((res) => {
        setPaymentData(res);
      })
      .catch((err: unknown) => {
        setPaymentError(err instanceof Error ? err.message : 'Gagal membuat sesi pembayaran.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      setOrderSnapshot(items);
      setIsSuccess(false);
      setPaymentData(null);
      setPaymentError(null);
      requestPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reservationId]);

  if (!isOpen) return null;

  const handleSimulatePay = async () => {
    setIsLoading(true);
    setPaymentError(null);
    try {
      if (paymentData) {
        await confirmPayment(paymentData.id);
      } else if (reservationId) {
        await confirmReservation(reservationId);
      }
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 2500);
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Pembayaran gagal diproses.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Modal Close Button */}
        <button className="modal-close-btn" onClick={onClose} disabled={isLoading}>
          <X size={20} />
        </button>

        {!isSuccess ? (
          <div className="payment-body">
            <div className="payment-header">
              <div className="qris-brand-box">
                <span className="qris-text">QRIS</span>
                <span className="qris-sub">GPN</span>
              </div>
              <h3 className="payment-title">Pembayaran Tiket</h3>
              <p className="payment-desc">
                Scan kode QR di bawah ini menggunakan aplikasi e-Wallet atau Mobile Banking Anda
              </p>
            </div>

            {paymentError && (
              <div className="payment-error-banner" role="alert">
                <AlertTriangle size={16} className="payment-error-icon" />
                <div className="payment-error-text">
                  <strong>Pembayaran gagal</strong>
                  <span>{paymentError}</span>
                </div>
                <button
                  className="payment-error-retry"
                  onClick={requestPayment}
                  disabled={isLoading}
                  title="Coba lagi"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Coba lagi
                </button>
              </div>
            )}

            {/* QR Mockup Card */}
            <div className="qr-wrapper">
              <div className="qr-box">
                {isLoading ? (
                  <div className="qr-loading">
                    <Loader2 size={40} className="animate-spin text-purple-600" />
                  </div>
                ) : paymentError && !paymentData ? (
                  // No QRIS session could be created: never show a fake QR.
                  <div className="qr-loading qr-unavailable">
                    <QrCode size={190} className="qr-image qr-image-muted" />
                  </div>
                ) : (
                  <>
                    <QrCode size={190} className="qr-image" />
                    <div className="qr-overlay-logo">
                      <span className="tickid-mini-badge">TickId</span>
                    </div>
                  </>
                )}
              </div>
              <div className="qr-amount-box">
                <span className="amount-label">Total Pembayaran:</span>
                <span className="amount-value">{formatRupiah(total)}</span>
              </div>
              {paymentData && bookingRef && (
                <div className="payment-meta-badge">Backend Verified · Ref: {bookingRef}</div>
              )}
            </div>

            <div className="payment-seats-info">
              <span className="info-title">Tiket yang dipesan ({totalTickets}):</span>
              <div className="info-chips">
                {orderSnapshot.map((item) => (
                  <span key={item.id} className="info-chip">
                    {lineLabel(item)}
                  </span>
                ))}
              </div>
            </div>

            <div className="security-notice">
              <ShieldCheck size={16} className="security-icon" />
              <span>Transaksi aman dan terverifikasi secara otomatis oleh sistem TickId.</span>
            </div>

            <button
              className="simulate-pay-btn"
              onClick={paymentError && !paymentData ? requestPayment : handleSimulatePay}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memproses Pembayaran...</span>
                </>
              ) : paymentError && !paymentData ? (
                <>
                  <RefreshCw size={18} />
                  <span>Coba Lagi</span>
                </>
              ) : (
                <span>Simulasikan Pembayaran Berhasil</span>
              )}
            </button>
          </div>
        ) : (
          <div className="payment-success-body">
            <div className="success-icon-wrapper">
              <CheckCircle size={56} className="success-icon" />
            </div>
            <h3 className="success-title">Pembayaran Berhasil!</h3>
            <p className="success-desc">
              E-Ticket resmi Anda telah berhasil diterbitkan dan status reservasi telah dikonfirmasi di server.
            </p>

            <div className="ticket-receipt-card">
              <div className="receipt-row">
                <span className="receipt-label">Booking ID</span>
                <span className="receipt-val code">{bookingRef || `TICK-${Date.now().toString().slice(-6)}`}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Event</span>
                <span className="receipt-val">{eventName ?? 'Event TickId'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Jumlah Tiket</span>
                <span className="receipt-val">{totalTickets} Tiket</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Total Dibayar</span>
                <span className="receipt-val highlight">{formatRupiah(total)}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Status Server</span>
                <span className="receipt-val highlight">CONFIRMED (DB)</span>
              </div>
            </div>

            <button className="download-ticket-btn" onClick={onClose}>
              <Download size={18} />
              <span>Simpan & Selesai</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
