/**
 * SeatMapScreen Component for TickId Desktop Application
 * Matches reverse-engineered Figma host app specifications
 * Features:
 *  - Interactive stadium seating plan screen coordinating SeatMap & OrderSummary
 *  - 270 total seats across 4 tiers (CAT 1 VIP, CAT 2 Festival, CAT 3 Tribun Bawah, CAT 4 Tribun Atas)
 *  - Top banner with Back button ('detail'), attendee counter ("8.420 antrean aktif"), and 5-minute lock warning
 *  - Zoom controls: (-0.1 clamped at 0.7x, +0.1 clamped at 1.4x, reset 100%)
 *  - Real-time OrderSummary integration (tax 10%, service fee Rp 35.000, 5-min timer)
 *  - Primary CTA "Lanjut ke Pembayaran QRIS"
 *  - Clean Architecture & Standalone state via NavigationContext & BookingContext with standalone fallback
 */

import React, { useCallback } from 'react';
import { ArrowLeft, Flame, AlertTriangle } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { SeatMap } from '../components/SeatMap';
import { OrderSummary } from '../components/OrderSummary';
import { Seat } from '../types/seat';
import { ScreenType } from '../types/navigation';

export interface SeatMapScreenProps {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  onProceedToPayment?: () => void;
  seats?: Seat[];
  selectedSeats?: Seat[];
  onToggleSeat?: (seat: Seat) => void;
  onRemoveSeat?: (seatId: string) => void;
}

export const SeatMapScreen: React.FC<SeatMapScreenProps> = ({
  onNavigate,
  onProceedToPayment,
  seats,
  selectedSeats,
  onToggleSeat,
  onRemoveSeat
}) => {
  // Graceful NavigationContext consumption
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  const handleBack = useCallback(() => {
    if (onNavigate) {
      onNavigate('detail');
    } else if (navContext) {
      navContext.navigateTo('detail');
    }
  }, [onNavigate, navContext]);

  return (
    <div className="seat-map-screen flex h-[calc(100vh-68px)] w-full overflow-hidden bg-canvas text-ink">
      {/* Left Column: Subheader + Zoomable Seat Map Canvas + Legend */}
      <div className="seat-map-main-column flex-1 flex flex-col min-w-0 bg-panel overflow-hidden">
        {/* Top Header Banner matching Figma Screenshot 1 */}
        <div className="seat-screen-header px-8 pt-5 pb-4 bg-canvas border-b border-line shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="btn-back-to-detail hover:text-indigo transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 text-ink-muted mr-1"
                  aria-label="Kembali ke Detail Event"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali</span>
                </button>
                <h1 className="text-lg font-bold font-display text-ink leading-tight">
                  Coldplay 2026 — Pilih Kursi
                </h1>
              </div>
              <p className="text-[12px] text-ink-soft mt-0.5">
                Stadion Utama Gelora Bung Karno
              </p>
            </div>

            {/* Live Attendee Counter Badge */}
            <div className="live-attendee-counter inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo/10 text-indigo text-[12px] font-medium">
              <Flame size={13} className="live-icon text-indigo" />
              <span>Live: 8.420 penonton sedang memilih kursi</span>
              <span className="sr-only">8.420 antrean aktif</span>
            </div>
          </div>

          {/* 5-Minute Seat Lock Warning Box */}
          <div className="seat-lock-alert mt-3 flex items-center gap-2 text-[12px] font-medium text-amber bg-amber/10 border border-amber/25 rounded-lg px-3 py-2 w-fit">
            <AlertTriangle size={14} className="shrink-0 text-amber" />
            <span>
              Kursi yang Anda klik akan di-lock selama 05:00 menit untuk menyelesaikan pembayaran.
            </span>
          </div>
        </div>

        {/* Zoomable Stadium Seating Plan */}
        <SeatMap
          seats={seats}
          onBack={handleBack}
          onToggleSeat={onToggleSeat}
          showBanner={false}
        />
      </div>

      {/* Right Column: Dynamic Order Summary Sidebar */}
      <aside className="order-summary-sidebar-column w-[360px] shrink-0 h-full bg-canvas border-l border-line flex flex-col overflow-hidden">
        <OrderSummary
          selectedSeats={selectedSeats}
          onRemoveSeat={onRemoveSeat}
          onProceedToPayment={onProceedToPayment}
        />
      </aside>
    </div>
  );
};

export default SeatMapScreen;
