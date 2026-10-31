/**
 * @file SeatMapScreenHeader.tsx
 * @description Renders top header banner with back button, attendee counter, and lock alert.
 */
import React from 'react';
import { ArrowLeft, Flame, AlertTriangle } from 'lucide-react';

interface ScreenHeaderProps {
  onBack: () => void;
}

export const renderSeatMapScreenHeader = ({ onBack }: ScreenHeaderProps): React.ReactElement => (
  <div className="seat-screen-header px-8 pt-5 pb-4 bg-canvas border-b border-line shrink-0">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
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
        <p className="text-[12px] text-ink-soft mt-0.5">Stadion Utama Gelora Bung Karno</p>
      </div>
      <div className="live-attendee-counter inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo/10 text-indigo text-[12px] font-medium">
        <Flame size={13} className="live-icon text-indigo" />
        <span>Live: 8.420 penonton sedang memilih kursi</span>
        <span className="sr-only">8.420 antrean aktif</span>
      </div>
    </div>
    <div className="seat-lock-alert mt-3 flex items-center gap-2 text-[12px] font-medium text-amber bg-amber/10 border border-amber/25 rounded-lg px-3 py-2 w-fit">
      <AlertTriangle size={14} className="shrink-0 text-amber" />
      <span>Kursi yang Anda klik akan di-lock selama 05:00 menit untuk menyelesaikan pembayaran.</span>
    </div>
  </div>
);
