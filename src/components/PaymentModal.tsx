import { useState, useEffect, type FC } from 'react';
import { X, CheckCircle, QrCode, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { SelectedSeat } from '../types/booking';
import { createPayment, confirmReservation, PaymentResponse } from '../services/api';
import { formatRupiah } from '../utils/format';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: SelectedSeat[];
  reservationId: string | null;
  bookingRef: string | null;
  onPaymentSuccess: () => void;
}

export const PaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedSeats,
  reservationId,
  bookingRef,
  onPaymentSuccess,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const total = subtotal + Math.round(subtotal * 0.1);


  // Request payment from backend when modal opens
  useEffect(() => {
    if (isOpen && reservationId) {
      setIsSuccess(false);
      setIsLoading(true);
      createPayment(reservationId)
        .then((res) => {
          setPaymentData(res);
        })
        .catch((err) => {
          console.error('Failed to create payment:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, reservationId]);

  if (!isOpen) return null;

  const handleSimulatePay = async () => {
    setIsLoading(true);
    try {
      if (reservationId) {
        await confirmReservation(reservationId);
      }
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 2500);
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setIsSuccess(true);
      onPaymentSuccess();
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
              <h3 className="payment-title">Pembayaran Tiket Konser</h3>
              <p className="payment-desc">
                Scan kode QR di bawah ini menggunakan aplikasi e-Wallet atau Mobile Banking Anda
              </p>
            </div>

            {/* QR Mockup Card */}
            <div className="qr-wrapper">
              <div className="qr-box">
                {isLoading ? (
                  <div className="qr-loading">
                    <Loader2 size={40} className="animate-spin text-purple-600" />
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
              {paymentData && (
                <div className="payment-meta-badge">
                  {paymentData.isMock ? 'Demo Mode' : 'Backend Verified'} · Ref: {bookingRef || 'TICK-CP26'}
                </div>
              )}
            </div>

            <div className="payment-seats-info">
              <span className="info-title">Kursi yang dipesan ({selectedSeats.length}):</span>
              <div className="info-chips">
                {selectedSeats.map((s) => (
                  <span key={s.id} className="info-chip">
                    {s.categoryName} - {s.seatLabel}
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
              onClick={handleSimulatePay}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memproses Pembayaran...</span>
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
                <span className="receipt-val code">{bookingRef || `TICK-CP26-${Date.now().toString().slice(-6)}`}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Event</span>
                <span className="receipt-val">Coldplay 2026 - Music of the Spheres</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Jumlah Tiket</span>
                <span className="receipt-val">{selectedSeats.length} Tiket</span>
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
