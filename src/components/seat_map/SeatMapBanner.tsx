/**
 * @file SeatMapBanner.tsx
 * @description Renders top navigation bar, attendee counter badge, and lock warning banner.
 */
import React from 'react';
import { ArrowLeft, Flame, AlertTriangle } from 'lucide-react';

interface BannerProps {
  onBack: () => void;
}

export const renderSeatMapBanner = ({ onBack }: BannerProps): React.ReactElement => (
  <div className="seat-map-top-banner mb-6 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="btn-back-detail p-2 rounded-xl bg-panel hover:bg-subtle border border-line text-ink transition-colors cursor-pointer flex items-center gap-2 text-sm font-semibold"
          aria-label="Kembali ke Detail Event"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Kembali ke Detail</span>
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-display text-ink tracking-tight">Coldplay 2026 — Pilih Kursi</h1>
          <p className="text-xs text-ink-muted">Stadion Utama Gelora Bung Karno · Jakarta</p>
        </div>
      </div>
      <div className="live-counter-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral/10 text-coral border border-coral/20 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm">
        <Flame size={15} className="live-icon text-coral animate-pulse" />
        <span>8.420 antrean aktif</span>
      </div>
    </div>
    <div className="seat-lock-warning-banner flex items-center gap-2.5 p-3.5 bg-amber/10 border border-amber/30 text-amber text-xs sm:text-sm rounded-2xl font-medium">
      <AlertTriangle size={18} className="shrink-0 text-amber" />
      <span>Kursi yang Anda klik akan di-lock selama 05:00 menit untuk menyelesaikan pembayaran.</span>
    </div>
  </div>
);
