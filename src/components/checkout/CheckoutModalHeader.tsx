/**
 * @file CheckoutModalHeader.tsx
 * @description Renders top header bar of CheckoutModal with timer and close button.
 */
import React from 'react';
import { X, Clock } from 'lucide-react';

interface HeaderProps {
  timer: string;
  onClose: () => void;
}

export const renderCheckoutModalHeader = ({ timer, onClose }: HeaderProps): React.ReactElement => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-canvas">
    <div>
      <h2 id="modal-title" className="text-base font-bold font-display text-ink leading-tight">
        Pembayaran Instan via QRIS
        <span className="sr-only">Pembayaran QRIS Instan</span>
      </h2>
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber mt-1">
        <Clock size={13} className="text-amber animate-spin" style={{ animationDuration: '6s' }} />
        <span>Selesaikan dalam <span className="countdown-timer font-mono font-semibold">{timer}</span></span>
      </div>
    </div>
    <button
      onClick={onClose}
      className="btn-close-modal w-8 h-8 rounded-full bg-subtle hover:bg-line text-ink-soft hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
      aria-label="Tutup Modal"
    >
      <X size={16} />
    </button>
  </div>
);
