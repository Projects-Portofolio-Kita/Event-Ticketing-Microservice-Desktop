/**
 * ETicketScreen Component for TickId Desktop Application
 * Matches reverse-engineered specifications from Figma host app
 * Features:
 *  - High-fidelity boarding-pass digital ticket with reference ID #TICK-ID-98214
 *  - Success alert notice: "Pembayaran Berhasil! E-Ticket Aktif"
 *  - Concert details: Title ("Coldplay Music of the Spheres World Tour 2026"), date ("15 November 2026"), venue ("Stadion Utama Gelora Bung Karno"), gate ("Gate 3 — Buka 17:00 WIB")
 *  - Buyer KYC badge ("KYC Terverifikasi") and buyer name ("Fajrul Rahman")
 *  - Tier name (e.g. "CAT 1 — VIP") and seat numbers list
 *  - Perforated ticket divider with semicircles and dashed divider line
 *  - Gate scan QR code (<QrCode size={140} seed={21} />) with label "Scan di Pintu Masuk"
 *  - Animated barcode bars (58 varying-width vertical bars with micro-animation breathe)
 *  - Anti-screenshot notice: "Dilarang mengambil tangkapan layar (screenshot). Tunjukkan e-ticket langsung dari aplikasi saat masuk gate."
 *  - Action buttons: "Simpan ke Wallet", "Unduh PDF", "Kirim ke Email"
 *  - Return button "Kembali ke Beranda" calling navigateTo('discover')
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  Download,
  Mail,
  Wallet,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Ticket
} from 'lucide-react';
import { QrCode } from '../components/QrCode';
import { useNavigation } from '../context/NavigationContext';
import { useBooking } from '../context/BookingContext';
import { mockETicketData } from '../data/mockTickets';
import { mockUser } from '../data/mockUser';
import { ScreenType } from '../types/navigation';
import { ETicketData } from '../types/ticket';
import { Seat } from '../types/seat';
import { generateBarcodeBars } from '../utils/format';

export interface ETicketScreenProps {
  onNavigate?: (screen: ScreenType) => void;
  ticketData?: ETicketData;
  selectedSeats?: Seat[];
}

export const ETicketScreen: React.FC<ETicketScreenProps> = ({
  onNavigate,
  ticketData = mockETicketData,
  selectedSeats: propSeats
}) => {
  // Graceful NavigationContext consumption
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  // Graceful BookingContext consumption
  let bookingContext: ReturnType<typeof useBooking> | null = null;
  try {
    bookingContext = useBooking();
  } catch {
    bookingContext = null;
  }

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleNavigateHome = () => {
    if (onNavigate) {
      onNavigate('discover');
    } else if (navContext) {
      navContext.navigateTo('discover');
    }
  };

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Extract seats info from booking context or prop or mock
  const seats = propSeats || bookingContext?.selectedSeats || [];
  const tierName = seats.length > 0
    ? (seats[0].tierName || 'CAT 1 — VIP')
    : 'CAT 1 — VIP';

  const seatsListString = seats.length > 0
    ? seats.map((s) => s.key || s.id).join(', ')
    : 'ROW C · NO 14 & 15';

  // Generate 58 barcode bars with deterministic varying widths via domain utility
  const barcodeBars = useMemo(() => generateBarcodeBars(58), []);

  return (
    <div className="eticket-screen w-full min-h-screen bg-canvas text-ink pb-24">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-ink text-white px-4 py-2.5 rounded-xl shadow-pop text-sm font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles size={16} className="text-amber" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* Top Breadcrumb & Return Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleNavigateHome}
            className="btn-back-home inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-panel hover:bg-subtle border border-line text-sm font-semibold text-ink transition-colors cursor-pointer"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </button>

          <span className="text-xs font-mono text-ink-muted">
            Status: <span className="text-emerald font-bold">Terverifikasi Aktif</span>
          </span>
        </div>

        {/* Success Alert Notice */}
        <div className="success-alert-banner mb-6 p-4 rounded-2xl bg-emerald-tint border border-emerald/30 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald/20 text-emerald flex items-center justify-center shrink-0">
              <CheckCircle size={22} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-ink font-display flex items-center gap-2">
                <span>Pembayaran Berhasil! E-Ticket Aktif</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-white border border-emerald/20 text-emerald">
                  {ticketData.referenceId || '#TICK-ID-98214'}
                </span>
              </h2>
              <p className="text-xs text-ink-muted">
                Tiket digital resmi telah diterbitkan dan terhubung langsung dengan sistem pintu masuk gate.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald/20 text-xs font-bold text-emerald">
            <ShieldCheck size={14} />
            <span>Anti-Fraud Aktif</span>
          </div>
        </div>

        {/* High-Fidelity Boarding Pass Digital Ticket */}
        <div className="boarding-pass-card relative w-full bg-white rounded-3xl border border-line shadow-pop overflow-hidden flex flex-col lg:flex-row mb-8">
          {/* Top Notch on Divider (Desktop) */}
          <div className="hidden lg:block absolute left-[calc(100%-300px)] -top-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />
          {/* Bottom Notch on Divider (Desktop) */}
          <div className="hidden lg:block absolute left-[calc(100%-300px)] -bottom-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />

          {/* Left Stub: Concert Metadata & Buyer Details */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
            {/* Top Pass Type & Event Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-violet/10 text-violet border border-violet/20 text-xs font-extrabold uppercase tracking-widest">
                  VIP ALL-ACCESS PASS
                </span>
                <span className="text-xs font-mono font-bold text-ink-muted reference-id">
                  {ticketData.referenceId || '#TICK-ID-98214'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-ink tracking-tight mb-1 event-title">
                Coldplay Music of the Spheres World Tour 2026
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mb-6">
                Special Guest: Musisi Indonesia Pilihan · Jakarta International Stadium / GBK
              </p>

              {/* Concert Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-panel rounded-2xl border border-line mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                    <Calendar size={13} className="text-indigo" />
                    <span>TANGGAL</span>
                  </div>
                  <div className="text-sm font-bold text-ink event-date">
                    15 November 2026
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                    <Clock size={13} className="text-indigo" />
                    <span>PINTU MASUK / GATE</span>
                  </div>
                  <div className="text-sm font-bold text-ink event-gate">
                    Gate 3 — Buka 17:00 WIB
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                    <MapPin size={13} className="text-indigo" />
                    <span>VENUE</span>
                  </div>
                  <div className="text-sm font-bold text-ink truncate event-venue">
                    Stadion Utama Gelora Bung Karno
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                    <Ticket size={13} className="text-indigo" />
                    <span>KATEGORI</span>
                  </div>
                  <div className="text-sm font-bold text-ink event-tier">
                    {tierName}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                    <Ticket size={13} className="text-indigo" />
                    <span>NOMOR KURSI</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-ink truncate event-seats">
                    {seatsListString}
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer KYC Verification Section */}
            <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-ink-muted">Atas Nama Pemilik Tiket:</div>
                <div className="text-sm font-bold text-ink buyer-name">
                  {ticketData.buyer?.name || mockUser.name}
                </div>
                <div className="text-xs text-ink-soft">
                  {ticketData.buyer?.email || mockUser.email}
                </div>
              </div>

              {/* KYC Verification Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-xs font-bold kyc-badge w-fit">
                <ShieldCheck size={14} />
                <span>KYC Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Perforated Ticket Divider (Desktop Vertical / Mobile Horizontal) */}
          <div className="relative flex lg:flex-col items-center justify-between lg:w-0 border-t-2 lg:border-t-0 lg:border-r-2 border-dashed border-line">
            {/* Mobile notches */}
            <div className="lg:hidden absolute -left-4 -top-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />
            <div className="lg:hidden absolute -right-4 -top-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />
          </div>

          {/* Right Stub: QR Code, Animated Barcode, and Gate Scan Info */}
          <div className="w-full lg:w-[300px] bg-panel p-6 sm:p-8 flex flex-col items-center justify-between border-l-0 lg:border-l border-line">
            <div className="text-center w-full">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink-muted block mb-1">
                Scan di Pintu Masuk
              </span>
              <span className="text-xs font-semibold text-indigo block mb-4">
                GATE 3B · SCAN DI GATE
              </span>

              {/* Dynamic Gate Scan QR Code */}
              <div className="qr-container p-3 bg-white rounded-2xl border border-line shadow-card inline-block mb-3">
                <QrCode size={140} seed={21} className="w-[140px] h-[140px]" />
              </div>

              <div className="text-[11px] font-mono text-ink-muted mb-2">
                ID: TICK-98214-GBK
              </div>
            </div>

            {/* Animated Barcode Bars (58 Bars with Breathe Micro-Animation) */}
            <div className="w-full my-3">
              <div
                className="barcode-container flex items-center justify-center h-12 w-full px-2 py-1 bg-white rounded-xl border border-line overflow-hidden"
                title="Barcode Gate Scanner"
              >
                {barcodeBars.map((w, idx) => (
                  <div
                    key={`bar-${idx}`}
                    className="barcode-bar h-10 bg-ink rounded-xs mx-[0.5px] breathe"
                    style={{
                      width: `${w}px`,
                      animationDelay: `${(idx % 10) * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <div className="text-center font-mono text-[10px] text-ink-muted tracking-widest mt-1">
                9821 · 4001 · 2026 · 8892
              </div>
            </div>

            {/* Anti-Screenshot Notice */}
            <div className="anti-screenshot-notice w-full mt-2 p-2.5 bg-amber/10 border border-amber/30 rounded-xl text-[11px] text-amber flex items-start gap-2">
              <AlertOctagon size={15} className="shrink-0 mt-0.5" />
              <p className="leading-tight">
                Dilarang mengambil tangkapan layar (screenshot). Tunjukkan e-ticket langsung dari aplikasi saat masuk gate.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="ticket-actions flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => showToast('Tiket berhasil disinkronkan ke Apple/Google Wallet!')}
            className="btn-save-wallet inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            aria-label="Simpan ke Wallet"
          >
            <Wallet size={16} />
            <span>Simpan ke Wallet</span>
          </button>

          <button
            onClick={() => showToast('E-Ticket PDF berhasil diunduh ke perangkat!')}
            className="btn-download-pdf inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-subtle border border-line text-xs sm:text-sm font-bold text-ink shadow-sm transition-all cursor-pointer"
            aria-label="Unduh PDF"
          >
            <Download size={16} />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={() => showToast(`E-Ticket telah dikirimkan ke email ${ticketData.buyer?.email || mockUser.email}!`)}
            className="btn-email-ticket inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-subtle border border-line text-xs sm:text-sm font-bold text-ink shadow-sm transition-all cursor-pointer"
            aria-label="Kirim ke Email"
          >
            <Mail size={16} />
            <span>Kirim ke Email</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETicketScreen;
