/**
 * SeatMap Component for TickId Desktop Application
 * Matches reverse-engineered Figma host app specifications
 * Features:
 *  - Interactive stadium seating plan across 4 tiers (CAT 1 VIP, CAT 2 Festival, CAT 3 Tribun Bawah, CAT 4 Tribun Atas)
 *  - Exactly 270 seats rendered from mockSeats (54 + 72 + 72 + 72)
 *  - Seat status styling (available: hover indigo, selected: bg-indigo pulse-indigo, locked: bg-amber/20 disabled, sold: bg-sold disabled)
 *  - Zoom controls: Zoom Out (-0.1 clamped at 0.7x), Zoom In (+0.1 clamped at 1.4x), Reset to 100% (1.0x)
 *  - Smooth transform scale(zoom)
 *  - Live attendee counter badge ("8.420 antrean aktif") and 5-minute lock warning
 *  - Back button navigating to 'detail'
 *  - Seamless integration with BookingContext and NavigationContext with standalone fallback
 *  - Backward compatibility with legacy App.tsx props
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Flame,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  X,
  ArrowLeft
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useNavigation } from '../context/NavigationContext';
import { mockSeats as defaultMockSeats } from '../data/mockSeats';
import { Seat, SeatTier, SeatStatus } from '../types/seat';
import { formatRupiah } from '../utils/format';
import { SeatCategory } from '../types/booking';

export interface SeatMapProps {
  seats?: Seat[];
  selectedSeatIds?: string[];
  onToggleSeat?: (...args: any[]) => void;
  onSeatAlert?: (msg: string) => void;
  onBack?: () => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showBanner?: boolean;
  // Backward compatibility with legacy App.tsx
  categories?: SeatCategory[];
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats = defaultMockSeats,
  selectedSeatIds,
  onToggleSeat,
  onSeatAlert,
  onBack,
  zoom: externalZoom,
  onZoomChange,
  showBanner = true
}) => {
  // Graceful BookingContext consumption with fallback
  let bookingContext: ReturnType<typeof useBooking> | null = null;
  try {
    bookingContext = useBooking();
  } catch {
    bookingContext = null;
  }

  // Graceful NavigationContext consumption with fallback
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  // Internal Zoom state clamped [0.7, 1.4]
  const [internalZoom, setInternalZoom] = useState<number>(1.0);
  const currentZoom = externalZoom !== undefined ? externalZoom : internalZoom;

  const handleZoomIn = useCallback(() => {
    setInternalZoom((prev) => {
      const base = externalZoom !== undefined ? externalZoom : prev;
      const nextZoom = +(Math.min(1.4, +(base + 0.1).toFixed(2))).toFixed(2);
      if (onZoomChange) onZoomChange(nextZoom);
      return nextZoom;
    });
  }, [externalZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    setInternalZoom((prev) => {
      const base = externalZoom !== undefined ? externalZoom : prev;
      const nextZoom = +(Math.max(0.7, +(base - 0.1).toFixed(2))).toFixed(2);
      if (onZoomChange) onZoomChange(nextZoom);
      return nextZoom;
    });
  }, [externalZoom, onZoomChange]);

  const handleResetZoom = useCallback(() => {
    const nextZoom = 1.0;
    setInternalZoom(nextZoom);
    if (onZoomChange) onZoomChange(nextZoom);
  }, [onZoomChange]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (navContext) {
      navContext.navigateTo('detail');
    }
  }, [onBack, navContext]);

  // Determine which seat IDs are currently selected
  const activeSelectedIds = useMemo<Set<string>>(() => {
    if (selectedSeatIds) {
      return new Set(selectedSeatIds);
    }
    if (bookingContext) {
      return new Set(bookingContext.selectedSeats.map((s) => s.id || s.key || ''));
    }
    return new Set<string>();
  }, [selectedSeatIds, bookingContext]);

  // Group seats by tier for structured stadium rendering
  const seatsByTier = useMemo(() => {
    const map: Record<SeatTier, Seat[]> = {
      cat1: [],
      cat2: [],
      cat3: [],
      cat4: []
    };

    seats.forEach((seat) => {
      if (map[seat.tier]) {
        map[seat.tier].push(seat);
      } else {
        map.cat1.push(seat);
      }
    });

    return map;
  }, [seats]);

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (seat.status === 'locked') {
        const msg = `Kursi ${seat.row}${seat.number} (${seat.tierName}) sedang di-lock penonton lain.`;
        if (onSeatAlert) onSeatAlert(msg);
        return;
      }
      if (seat.status === 'sold') {
        const msg = `Kursi ${seat.row}${seat.number} (${seat.tierName}) sudah terjual.`;
        if (onSeatAlert) onSeatAlert(msg);
        return;
      }

      if (onToggleSeat) {
        onToggleSeat(seat, seat.tierName, seat.label || '');
      } else if (bookingContext) {
        bookingContext.toggleSeat(seat);
      }
    },
    [onToggleSeat, bookingContext, onSeatAlert]
  );

  const formatPrice = formatRupiah;

  // Helper to render rows of a tier (18 cols: left block 1-9, aisle, right block 10-18)
  const renderTierRows = (tierSeats: Seat[], _tierColor: string) => {
    // Group seats by row letter
    const rowMap: Record<string, Seat[]> = {};
    tierSeats.forEach((seat) => {
      if (!rowMap[seat.row]) {
        rowMap[seat.row] = [];
      }
      rowMap[seat.row].push(seat);
    });

    const rowLetters = Object.keys(rowMap).sort();

    return (
      <div className="tier-seat-rows flex flex-col items-center gap-1.5 py-3 rounded-xl bg-canvas border border-line">
        {rowLetters.map((rowLetter) => {
          const rowSeats = rowMap[rowLetter].sort((a, b) => a.number - b.number);
          const leftBlock = rowSeats.filter((s) => s.number <= 9);
          const rightBlock = rowSeats.filter((s) => s.number > 9);

          return (
            <div
              key={rowLetter}
              className="seat-row-container flex items-center justify-center gap-6"
            >
              <div className="flex items-center gap-1.5">
                {leftBlock.map((seat) => renderSeatButton(seat, _tierColor))}
              </div>
              <div className="flex items-center gap-1.5">
                {rightBlock.map((seat) => renderSeatButton(seat, _tierColor))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSeatButton = (seat: Seat, _tierColor?: string) => {
    const isSelected =
      activeSelectedIds.has(seat.id) || activeSelectedIds.has(seat.key || '');
    const effectiveStatus: SeatStatus = isSelected ? 'selected' : seat.status;

    let statusClass = '';
    let isClickDisabled = false;
    let iconNode: React.ReactNode = null;

    if (effectiveStatus === 'selected') {
      statusClass = 'seat-selected bg-indigo text-white ring-2 ring-indigo/40 pulse-indigo scale-110';
    } else if (effectiveStatus === 'locked') {
      statusClass = 'seat-locked bg-amber bg-amber/20 cursor-not-allowed';
      iconNode = <Clock size={8} className="text-white mx-auto" />;
      isClickDisabled = true;
    } else if (effectiveStatus === 'sold') {
      statusClass = 'seat-sold bg-sold cursor-not-allowed';
      iconNode = <X size={8} className="text-white mx-auto" />;
      isClickDisabled = true;
    } else {
      // available
      statusClass = 'seat-available bg-emerald border border-white hover:scale-125 hover:ring-2 hover:ring-emerald/40 cursor-pointer';
    }

    return (
      <button
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        disabled={isClickDisabled}
        aria-disabled={isClickDisabled}
        aria-label={`${seat.tierName} Row ${seat.row} No ${seat.number} - ${effectiveStatus}`}
        data-seat-id={seat.id}
        data-seat-number={seat.number}
        data-row={seat.row}
        data-tier={seat.tier}
        data-status={effectiveStatus}
        title={isClickDisabled ? effectiveStatus : `${seat.tierName} · Row ${seat.row} · Seat ${seat.number}`}
        className={`seat-btn w-3.5 h-3.5 rounded-full grid place-items-center transition-all ${statusClass}`}
      >
        {iconNode}
      </button>
    );
  };

  return (
    <div className="seat-map-wrapper w-full">
      {/* Top Banner (Optional / Header Integration) */}
      {showBanner && (
        <div className="seat-map-top-banner mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="btn-back-detail p-2 rounded-xl bg-panel hover:bg-subtle border border-line text-ink transition-colors cursor-pointer flex items-center gap-2 text-sm font-semibold"
                aria-label="Kembali ke Detail Event"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Kembali ke Detail</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold font-display text-ink tracking-tight">
                  Coldplay 2026 — Pilih Kursi
                </h1>
                <p className="text-xs text-ink-muted">
                  Stadion Utama Gelora Bung Karno · Jakarta
                </p>
              </div>
            </div>

            {/* Live Attendee Counter Badge */}
            <div className="live-counter-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral/10 text-coral border border-coral/20 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm">
              <Flame size={15} className="live-icon text-coral animate-pulse" />
              <span>8.420 antrean aktif</span>
            </div>
          </div>

          {/* 5-Minute Seat Lock Warning Banner */}
          <div className="seat-lock-warning-banner flex items-center gap-2.5 p-3.5 bg-amber/10 border border-amber/30 text-amber text-xs sm:text-sm rounded-2xl font-medium">
            <AlertTriangle size={18} className="shrink-0 text-amber" />
            <span>
              Kursi yang Anda klik akan di-lock selama 05:00 menit untuk menyelesaikan pembayaran.
            </span>
          </div>
        </div>
      )}

      {/* Floating Zoom Controls Bar */}
      <div className="zoom-controls-wrapper mb-6 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted">
          Peta Denah Stadion (Total 270 Kursi)
        </span>

        <div className="zoom-controls-bar flex items-center gap-1.5 bg-panel border border-line p-1.5 rounded-2xl shadow-card">
          <button
            onClick={handleZoomOut}
            title="Perkecil (-0.1)"
            aria-label="Zoom Out"
            className="zoom-btn-out p-1.5 rounded-xl bg-canvas hover:bg-subtle text-ink border border-line transition-colors cursor-pointer"
          >
            <ZoomOut size={15} />
          </button>

          <span
            className="zoom-value-text font-mono font-bold text-xs text-ink px-2.5 min-w-[48px] text-center select-none"
            title="Current zoom"
          >
            {Math.round(currentZoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            title="Perbesar (+0.1)"
            aria-label="Zoom In"
            className="zoom-btn-in p-1.5 rounded-xl bg-canvas hover:bg-subtle text-ink border border-line transition-colors cursor-pointer"
          >
            <ZoomIn size={15} />
          </button>

          <div className="h-4 w-px bg-line mx-1" />

          <button
            onClick={handleResetZoom}
            title="Reset Zoom ke 100%"
            aria-label="Reset Zoom"
            className="zoom-btn-reset px-2.5 py-1 rounded-xl bg-canvas hover:bg-subtle text-[11px] font-semibold text-ink-soft border border-line transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>100%</span>
          </button>
        </div>
      </div>

      {/* Zoomable Stadium Seating Plan Container */}
      <div className="stadium-viewport-container flex-1 overflow-auto relative">
        <div
          className="stadium-zoom-canvas min-h-full p-8 flex flex-col items-center origin-top transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${currentZoom})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Main Stage Banner with curved top and indigo glow */}
          <div className="w-2/3 max-w-2xl mb-8">
            <div
              className="h-14 rounded-t-[100%] grid place-items-center text-[12px] font-semibold tracking-[0.25em] text-indigo bg-indigo/8 border border-indigo/25 border-b-0"
              style={{ boxShadow: '0 -10px 30px -8px rgba(79,70,229,0.3)' }}
            >
              PANGGUNG UTAMA / STAGE
            </div>
          </div>

          <div className="space-y-6 w-full max-w-4xl">
            {/* Tier 1: CAT 1 VIP (54 seats) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
                  <span className="text-[13px] font-semibold text-ink">
                    <span className="sr-only">CAT 1 — VIP Soundcheck</span>
                    CAT 1
                  </span>
                  <span className="text-[12px] text-ink-muted">· VIP Soundcheck</span>
                </div>
                <span className="font-mono text-[12px] text-ink-soft">
                  {formatPrice(3500000)}
                </span>
              </div>
              {renderTierRows(seatsByTier.cat1, '#7c3aed')}
            </div>

            {/* Tier 2: CAT 2 Festival (72 seats) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />
                  <span className="text-[13px] font-semibold text-ink">
                    <span className="sr-only">CAT 2 — Festival / Free Standing</span>
                    CAT 2
                  </span>
                  <span className="text-[12px] text-ink-muted">· Festival / Free Standing</span>
                </div>
                <span className="font-mono text-[12px] text-ink-soft">
                  {formatPrice(2100000)}
                </span>
              </div>
              {renderTierRows(seatsByTier.cat2, '#4f46e5')}
            </div>

            {/* Tier 3: CAT 3 Tribun Bawah (72 seats) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                  <span className="text-[13px] font-semibold text-ink">
                    <span className="sr-only">CAT 3 — Tribun Bawah</span>
                    CAT 3
                  </span>
                  <span className="text-[12px] text-ink-muted">· Tribun Bawah</span>
                </div>
                <span className="font-mono text-[12px] text-ink-soft">
                  {formatPrice(1500000)}
                </span>
              </div>
              {renderTierRows(seatsByTier.cat3, '#06b6d4')}
            </div>

            {/* Tier 4: CAT 4 Tribun Atas (72 seats) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
                  <span className="text-[13px] font-semibold text-ink">
                    <span className="sr-only">CAT 4 — Tribun Atas</span>
                    CAT 4
                  </span>
                  <span className="text-[12px] text-ink-muted">· Tribun Atas</span>
                </div>
                <span className="font-mono text-[12px] text-ink-soft">
                  {formatPrice(750000)}
                </span>
              </div>
              {renderTierRows(seatsByTier.cat4, '#64748b')}
            </div>
          </div>
        </div>

        {/* Floating Zoom Controls Bar */}
        <div className="sticky bottom-4 w-fit bg-canvas border border-line shadow-card rounded-xl p-1.5 flex items-center gap-1 ml-4 z-20">
          <button
            onClick={handleZoomOut}
            title="Perkecil (-0.1)"
            aria-label="Zoom Out"
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-subtle text-ink-soft cursor-pointer transition-colors"
          >
            <ZoomOut size={15} />
          </button>

          <span
            className="font-mono text-[11px] text-ink-soft w-10 text-center select-none"
            title="Current zoom"
          >
            {Math.round(currentZoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            title="Perbesar (+0.1)"
            aria-label="Zoom In"
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-subtle text-ink-soft cursor-pointer transition-colors"
          >
            <ZoomIn size={15} />
          </button>

          <div className="w-px h-5 bg-line mx-0.5" />

          <button
            onClick={handleResetZoom}
            title="Reset Zoom ke 100%"
            aria-label="Reset Zoom"
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-subtle text-ink-soft cursor-pointer transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Bottom Seat Legend Bar */}
      <footer className="seat-legend-bar px-8 py-3 bg-canvas border-t border-line flex items-center gap-6 text-[12px] text-ink-soft flex-wrap shrink-0">
        <div className="legend-item flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald border-2 border-white ring-1 ring-emerald/40" />
          <span>Tersedia</span>
        </div>

        <div className="legend-item flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo ring-2 ring-indigo/40" />
          <span className="font-semibold text-indigo">Dipilih Anda</span>
        </div>

        <div className="legend-item flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber grid place-items-center">
            <Clock size={8} className="text-white" />
          </span>
          <span>Di-lock Orang Lain</span>
        </div>

        <div className="legend-item flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-sold grid place-items-center">
            <X size={8} className="text-white" />
          </span>
          <span>Terjual</span>
        </div>
      </footer>
    </div>
  );
};

export default SeatMap;
