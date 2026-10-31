/**
 * @file SeatMapZoomBar.tsx
 * @description Renders top and sticky zoom controls for stadium plan viewport.
 */
import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomBarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  sticky?: boolean;
}

export const renderSeatMapZoomBar = ({
  zoom, onZoomIn, onZoomOut, onReset, sticky = false
}: ZoomBarProps): React.ReactElement => {
  if (sticky) {
    return (
      <div className="sticky bottom-4 w-fit bg-canvas border border-line shadow-card rounded-xl p-1.5 flex items-center gap-1 ml-4 z-20">
        <button onClick={onZoomOut} title="Perkecil (-0.1)" aria-label="Zoom Out" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-subtle text-ink-soft cursor-pointer transition-colors"><ZoomOut size={15} /></button>
        <span className="font-mono text-[11px] text-ink-soft w-10 text-center select-none" title="Current zoom">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} title="Perbesar (+0.1)" aria-label="Zoom In" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-subtle text-ink-soft cursor-pointer transition-colors"><ZoomIn size={15} /></button>
        <div className="w-px h-5 bg-line mx-0.5" />
        <button onClick={onReset} title="Reset Zoom ke 100%" aria-label="Reset Zoom" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-subtle text-ink-soft cursor-pointer transition-colors"><RotateCcw size={15} /></button>
      </div>
    );
  }
  return (
    <div className="zoom-controls-wrapper mb-6 flex items-center justify-between">
      <span className="text-xs font-semibold text-ink-muted">Peta Denah Stadion (Total 270 Kursi)</span>
      <div className="zoom-controls-bar flex items-center gap-1.5 bg-panel border border-line p-1.5 rounded-2xl shadow-card">
        <button onClick={onZoomOut} title="Perkecil (-0.1)" aria-label="Zoom Out" className="zoom-btn-out p-1.5 rounded-xl bg-canvas hover:bg-subtle text-ink border border-line transition-colors cursor-pointer"><ZoomOut size={15} /></button>
        <span className="zoom-value-text font-mono font-bold text-xs text-ink px-2.5 min-w-[48px] text-center select-none" title="Current zoom">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} title="Perbesar (+0.1)" aria-label="Zoom In" className="zoom-btn-in p-1.5 rounded-xl bg-canvas hover:bg-subtle text-ink border border-line transition-colors cursor-pointer"><ZoomIn size={15} /></button>
        <div className="h-4 w-px bg-line mx-1" />
        <button onClick={onReset} title="Reset Zoom ke 100%" aria-label="Reset Zoom" className="zoom-btn-reset px-2.5 py-1 rounded-xl bg-canvas hover:bg-subtle text-[11px] font-semibold text-ink-soft border border-line transition-colors cursor-pointer flex items-center gap-1"><RotateCcw size={12} /><span>100%</span></button>
      </div>
    </div>
  );
};
