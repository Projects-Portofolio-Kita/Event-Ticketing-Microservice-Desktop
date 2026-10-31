/**
 * @file SeatMapLegend.tsx
 * @description Renders seat status legend bar at the bottom of the seatmap.
 */
import React from 'react';
import { Clock, X } from 'lucide-react';

export const renderSeatMapLegend = (): React.ReactElement => (
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
);
