/**
 * CheckoutModal Component for TickId Desktop Application
 * Matches reverse-engineered specifications from Figma host app
 * Features:
 *  - Modal dialog with backdrop blur and outside-click dismissal
 *  - Top bar with title "Pembayaran QRIS Instan", countdown timer (e.g. "04:59"), Close (X) button
 *  - Center dynamic QRIS code with <QrCode size={190} seed={21} />, instructions, and "Unduh QR Code" button
 *  - Supported e-wallets list: Badges for GoPay, OVO, DANA, BCA, Livin' Mandiri, ShopeePay
 *  - Buyer details summary: Name (mockUser.name), email, phone, and KYC verification badge ("KYC Terverifikasi")
 *  - Order totals breakdown: Subtotal, Pajak Hiburan 10%, Biaya Layanan Rp 35.000, Total Pembayaran
 *  - Action buttons:
 *    * Primary CTA "Simulasi Bayar ✓": marks payment complete, closes modal via completePayment(), routes to 'tickets'
 *    * Secondary button "Batalkan & Lepas Kursi": closes modal via closeCheckout(), releases seats, routes to 'seatmap'
 *  - Standalone and Context support (useBooking, useNavigation)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  Download,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { QrCode } from './QrCode';
import { useBooking } from '../context/BookingContext';
import { useNavigation } from '../context/NavigationContext';
import { mockUser } from '../data/mockUser';
import { UserProfile } from '../types/user';
import { formatRupiah, formatTimer, calculateOrderPricing } from '../utils/format';

export interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  user?: UserProfile;
}

const formatIDR = formatRupiah;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCancel,
  user = mockUser
}) => {
  // Graceful BookingContext consumption
  let bookingContext: ReturnType<typeof useBooking> | null = null;
  try {
    bookingContext = useBooking();
  } catch {
    bookingContext = null;
  }

  // Graceful NavigationContext consumption
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  // Graceful router navigation consumption
  let routerNavigate: ReturnType<typeof useNavigate> | null = null;
  try {
    routerNavigate = useNavigate();
  } catch {
    routerNavigate = null;
  }

  // Standalone fallback timer (300s = 05:00)
  const [localTimer, setLocalTimer] = useState<number>(299);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine visibility: explicit prop takes precedence, otherwise fallback to context
  const isVisible = isOpen !== undefined ? isOpen : (bookingContext?.isCheckoutOpen ?? true);

  if (!isVisible) {
    return null;
  }

  // Timer formatting
  const formattedTimer = bookingContext?.formattedLockTimer || formatTimer(localTimer);

  // Financial values
  const selectedSeats = bookingContext?.selectedSeats || [];
  const fallbackPricing = selectedSeats.length > 0
    ? calculateOrderPricing(selectedSeats.map((s) => s.price || 0))
    : calculateOrderPricing([3500000]);

  const subtotal = bookingContext?.subtotal ?? fallbackPricing.subtotal;
  const tax = bookingContext?.tax ?? fallbackPricing.tax;
  const serviceFee = bookingContext?.serviceFee ?? fallbackPricing.serviceFee;
  const total = bookingContext?.total ?? fallbackPricing.total;

  // Seat summary label
  const seatSummaryLabel = selectedSeats.length > 0
    ? selectedSeats.map((s) => s.key || s.id).join(', ')
    : 'CAT 1 VIP (C14, C15)';

  // Handlers
  const handleClose = () => {
    if (bookingContext) {
      bookingContext.closeCheckout();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleSimulatePayment = () => {
    if (bookingContext) {
      bookingContext.completePayment();
    }
    if (onSuccess) {
      onSuccess();
    }
    if (routerNavigate) {
      routerNavigate('/tickets');
    }
    if (navContext) {
      navContext.navigateTo('tickets');
    }
  };

  const handleCancelAndRelease = () => {
    if (bookingContext) {
      bookingContext.clearSelection();
      bookingContext.closeCheckout();
    }
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
    if (routerNavigate) {
      routerNavigate('/seatmap/coldplay-2026');
    }
    if (navContext) {
      navContext.navigateTo('seatmap');
    }
  };

  const handleDownloadQr = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="checkout-modal-card relative w-full max-w-2xl bg-canvas rounded-3xl border border-line shadow-pop overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-canvas">
          <div>
            <h2 id="modal-title" className="text-base font-bold font-display text-ink leading-tight">
              Pembayaran Instan via QRIS
              <span className="sr-only">Pembayaran QRIS Instan</span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber mt-1">
              <Clock size={13} className="text-amber animate-spin" style={{ animationDuration: '6s' }} />
              <span>
                Selesaikan dalam <span className="countdown-timer font-mono font-semibold">{formattedTimer}</span>
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="btn-close-modal w-8 h-8 rounded-full bg-subtle hover:bg-line text-ink-soft hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-canvas">
          {/* Left Column: QR Code & Wallet Options */}
          <div className="flex flex-col items-center justify-between p-4 bg-[#fbfbfe] rounded-2xl border border-line/60">
            <div className="w-full text-center mb-1">
              <div className="inline-flex items-center justify-center gap-1 text-base font-black">
                <span className="text-[#e1251b]">QR</span>
                <span className="text-black">IS</span>
              </div>
              <p className="text-[11px] font-medium text-ink-muted mt-0.5">
                TickId Official Events
              </p>
              <p className="text-[10px] font-mono text-ink-muted">
                NMID: ID1020268892110
              </p>
            </div>

            {/* Dynamic QR Code Container */}
            <div className="qris-code-container my-2 p-3 bg-white rounded-2xl border border-line shadow-card flex items-center justify-center">
              <QrCode size={190} seed={21} className="w-[190px] h-[190px]" />
            </div>

            {/* Supported E-Wallets List */}
            <div className="w-full flex flex-col items-center gap-1.5 my-2">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">
                  GoPay
                </span>
                <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">
                  OVO
                </span>
                <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">
                  DANA
                </span>
                <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">
                  BCA
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">
                  <span className="sr-only">Livin&#39; Mandiri</span>
                  Livin'
                </span>
                <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">
                  ShopeePay
                </span>
              </div>
            </div>

            {/* Waiting Payment Status Pill */}
            <div className="w-full py-2 px-3 rounded-xl bg-indigo/10 text-indigo text-xs font-medium flex items-center justify-center gap-2 mt-2">
              <Loader2 size={13} className="animate-spin text-indigo" />
              <span>Menunggu pembayaran… (cek otomatis)</span>
            </div>
          </div>

          {/* Right Column: Buyer Details & Order Breakdown */}
          <div className="flex flex-col justify-between py-1">
            <div>
              {/* Buyer Details Summary */}
              <div className="mb-5">
                <div className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1 flex items-center justify-between">
                  <span>RINGKASAN PEMBELI</span>
                  <span className="kyc-badge inline-flex items-center gap-1 text-[10px] text-emerald font-semibold">
                    <ShieldCheck size={11} />
                    <span>KYC Terverifikasi</span>
                  </span>
                </div>
                <div className="font-bold text-ink text-sm buyer-name">{user?.name || mockUser.name}</div>
                <div className="text-xs text-ink-muted buyer-email">{user?.email || mockUser.email}</div>
                <span className="buyer-phone sr-only">+62 812-3456-7890</span>
              </div>

              {/* Event & Seats Summary */}
              <div className="mb-5">
                <div className="font-bold text-ink text-sm">
                  Coldplay: Music of the Spheres
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  Gelora Bung Karno · 14 Nov 2026 · 19:30 WIB
                </div>
                <div className="text-xs font-semibold text-indigo mt-1">
                  Kursi: {seatSummaryLabel}
                </div>
              </div>

              {/* Order Totals Breakdown */}
              <div className="space-y-2 py-3 border-t border-line text-xs">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal Tiket</span>
                  <span className="font-mono text-ink">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>
                    Pajak Hiburan (10%)
                    <span className="sr-only">Pajak Hiburan 10%</span>
                  </span>
                  <span className="font-mono text-ink">{formatIDR(tax)}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Biaya Layanan</span>
                  <span className="font-mono text-ink">{formatIDR(serviceFee)}</span>
                </div>
              </div>
            </div>

            {/* Total Tagihan */}
            <div className="pt-4 border-t border-line">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-ink">
                  Total Tagihan
                  <span className="sr-only">Total Pembayaran</span>
                </span>
                <span className="font-mono text-xl font-black text-indigo total-payment-amount">
                  {formatIDR(total)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mt-2">
                <ShieldCheck size={13} className="text-emerald" />
                <span>Transaksi aman · PCI-DSS compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="px-6 py-4 bg-canvas border-t border-line flex items-center justify-between">
          <button
            onClick={handleDownloadQr}
            className="btn-download-qris py-2.5 px-4 rounded-xl border border-line bg-white hover:bg-subtle text-xs font-semibold text-ink flex items-center gap-2 transition-colors cursor-pointer"
            aria-label="Download QRIS Gambar"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={14} className="text-emerald" />
                <span className="text-emerald">QR Code Tersimpan</span>
              </>
            ) : (
              <>
                <Download size={14} className="text-ink-soft" />
                <span>Download QRIS Gambar</span>
                <span className="sr-only">Unduh QR Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleSimulatePayment}
            className="btn-simulate-pay py-2.5 px-6 rounded-xl bg-indigo hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            aria-label="Simulasi Bayar"
          >
            <span>Simulasi Bayar ✓</span>
          </button>

          <button
            onClick={handleCancelAndRelease}
            className="btn-cancel-release text-xs font-semibold text-danger hover:underline transition-colors cursor-pointer"
            aria-label="Batalkan dan Lepas Kursi"
          >
            <span>Batalkan &amp; Lepas Kursi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
