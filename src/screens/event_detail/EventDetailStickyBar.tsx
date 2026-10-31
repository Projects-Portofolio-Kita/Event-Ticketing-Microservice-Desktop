/**
 * @file EventDetailStickyBar.tsx
 * @description Renders sticky bottom booking bar with pricing range and seatmap CTA.
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface StickyBarProps {
  onSelectSeats: () => void;
}

export const renderEventDetailStickyBar = ({ onSelectSeats }: StickyBarProps): React.ReactElement => (
  <aside className="sticky-booking-bar sticky bottom-0 h-[76px] bg-canvas/95 backdrop-blur-md border-t border-line flex items-center justify-between px-8 z-30 shadow-card">
    <p className="text-[13px] text-ink-soft">
      Harga mulai <span className="price-range-text font-semibold text-ink">Rp 750.000 – Rp 3.500.000</span>{' '}
      <span className="text-ink-muted">(belum termasuk pajak 10%)</span>
    </p>
    <button
      onClick={onSelectSeats}
      className="btn-pilih-kursi grad-brand shadow-brand text-white font-semibold text-[16px] h-12 px-7 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
    >
      <span>Pilih Kursi Sekarang</span>
      <ArrowRight size={18} />
    </button>
  </aside>
);
