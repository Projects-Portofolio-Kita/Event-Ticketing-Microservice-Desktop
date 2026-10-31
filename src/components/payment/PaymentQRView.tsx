/**
 * @file PaymentQRView.tsx
 * @description QRIS code presentation, total amount, chips, and simulation trigger.
 */
import type { FC } from 'react';
import { QrCode, ShieldCheck, Loader2 } from 'lucide-react';
import { SelectedSeat } from '../../types/booking';
import { PaymentResponse } from '../../services/api';
import { formatRupiah } from '../../utils/format';

export interface PaymentQRViewProps {
  isLoading: boolean;
  total: number;
  paymentData: PaymentResponse | null;
  bookingRef: string | null;
  selectedSeats: SelectedSeat[];
  onSimulatePay: () => void;
}

export const PaymentQRView: FC<PaymentQRViewProps> = ({
  isLoading, total, paymentData, bookingRef, selectedSeats, onSimulatePay,
}) => (
  <div className="payment-body">
    <div className="payment-header">
      <div className="qris-brand-box"><span className="qris-text">QRIS</span><span className="qris-sub">GPN</span></div>
      <h3 className="payment-title">Pembayaran Tiket Konser</h3>
      <p className="payment-desc">Scan kode QR di bawah ini menggunakan aplikasi e-Wallet atau Mobile Banking Anda</p>
    </div>
    <div className="qr-wrapper">
      <div className="qr-box">
        {isLoading ? <div className="qr-loading"><Loader2 size={40} className="animate-spin text-purple-600" /></div> : (
          <><QrCode size={190} className="qr-image" /><div className="qr-overlay-logo"><span className="tickid-mini-badge">TickId</span></div></>
        )}
      </div>
      <div className="qr-amount-box"><span className="amount-label">Total Pembayaran:</span><span className="amount-value">{formatRupiah(total)}</span></div>
      {paymentData && <div className="payment-meta-badge">{paymentData.isMock ? 'Demo Mode' : 'Backend Verified'} · Ref: {bookingRef || 'TICK-CP26'}</div>}
    </div>
    <div className="payment-seats-info">
      <span className="info-title">Kursi yang dipesan ({selectedSeats.length}):</span>
      <div className="info-chips">{selectedSeats.map((s) => <span key={s.id} className="info-chip">{s.categoryName} - {s.seatLabel}</span>)}</div>
    </div>
    <div className="security-notice"><ShieldCheck size={16} className="security-icon" /><span>Transaksi aman dan terverifikasi secara otomatis oleh sistem TickId.</span></div>
    <button className="simulate-pay-btn" onClick={onSimulatePay} disabled={isLoading}>
      {isLoading ? <><Loader2 size={18} className="animate-spin" /><span>Memproses Pembayaran...</span></> : <span>Simulasikan Pembayaran Berhasil</span>}
    </button>
  </div>
);
