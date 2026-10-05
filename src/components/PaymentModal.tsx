import { useState, type FC } from 'react';
import { X, CheckCircle, QrCode, ShieldCheck, Download } from 'lucide-react';
import { SelectedSeat } from '../types/booking';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: SelectedSeat[];
  onPaymentSuccess: () => void;
}

export const PaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedSeats,
  onPaymentSuccess,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const total = subtotal + Math.round(subtotal * 0.1);
  const formatRupiah = (num: number) => 'Rp ' + num.toLocaleString('id-ID');

  const handleSimulatePay = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onPaymentSuccess();
    }, 2500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Modal Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
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
              <p className="payment-desc">Scan kode QR di bawah ini menggunakan aplikasi e-Wallet atau Mobile Banking Anda</p>
            </div>

            {/* QR Mockup Card */}
            <div className="qr-wrapper">
              <div className="qr-box">
                <QrCode size={190} className="qr-image" />
                <div className="qr-overlay-logo">
                  <span className="tickid-mini-badge">TickId</span>
                </div>
              </div>
              <div className="qr-amount-box">
                <span className="amount-label">Total Pembayaran:</span>
                <span className="amount-value">{formatRupiah(total)}</span>
              </div>
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

            <button className="simulate-pay-btn" onClick={handleSimulatePay}>
              Simulasikan Pembayaran Berhasil
            </button>
          </div>
        ) : (
          <div className="payment-success-body">
            <div className="success-icon-wrapper">
              <CheckCircle size={56} className="success-icon" />
            </div>
            <h3 className="success-title">Pembayaran Berhasil!</h3>
            <p className="success-desc">
              E-Ticket resmi Anda telah berhasil diterbitkan dan siap digunakan untuk masuk ke venue.
            </p>

            <div className="ticket-receipt-card">
              <div className="receipt-row">
                <span className="receipt-label">Booking ID</span>
                <span className="receipt-val code">TICK-CP26-{Math.floor(100000 + Math.random() * 900000)}</span>
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
