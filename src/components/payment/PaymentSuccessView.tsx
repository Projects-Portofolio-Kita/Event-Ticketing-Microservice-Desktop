/**
 * @file PaymentSuccessView.tsx
 * @description Payment completion receipt card and confirmation details.
 */
import type { FC } from 'react';
import { CheckCircle, Download } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

export interface PaymentSuccessViewProps {
  bookingRef: string | null;
  seatCount: number;
  total: number;
  onClose: () => void;
}

export const PaymentSuccessView: FC<PaymentSuccessViewProps> = ({ bookingRef, seatCount, total, onClose }) => (
  <div className="payment-success-body">
    <div className="success-icon-wrapper"><CheckCircle size={56} className="success-icon" /></div>
    <h3 className="success-title">Pembayaran Berhasil!</h3>
    <p className="success-desc">E-Ticket resmi Anda telah berhasil diterbitkan dan status reservasi telah dikonfirmasi.</p>
    <div className="ticket-receipt-card">
      <div className="receipt-row"><span className="receipt-label">Booking ID</span><span className="receipt-val code">{bookingRef || `TICK-CP26-${Date.now().toString().slice(-6)}`}</span></div>
      <div className="receipt-row"><span className="receipt-label">Event</span><span className="receipt-val">Coldplay 2026 - Music of the Spheres</span></div>
      <div className="receipt-row"><span className="receipt-label">Jumlah Tiket</span><span className="receipt-val">{seatCount} Tiket</span></div>
      <div className="receipt-row"><span className="receipt-label">Total Dibayar</span><span className="receipt-val highlight">{formatRupiah(total)}</span></div>
      <div className="receipt-row"><span className="receipt-label">Status Server</span><span className="receipt-val highlight">CONFIRMED (DB)</span></div>
    </div>
    <button className="download-ticket-btn" onClick={onClose}><Download size={18} /><span>Simpan & Selesai</span></button>
  </div>
);
