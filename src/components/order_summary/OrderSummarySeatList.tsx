/**
 * @file OrderSummarySeatList.tsx
 * @description Renders selected seats list with remove buttons or empty state placeholder.
 */
import React from 'react';
import { X } from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import { NormalizedSummarySeat } from './order_summary_types';

interface OrderSummarySeatListProps {
  seats: NormalizedSummarySeat[];
  onRemove: (item: NormalizedSummarySeat) => void;
}

export const renderOrderSummarySeatList = ({
  seats,
  onRemove
}: OrderSummarySeatListProps): React.ReactElement => (
  <div className="selected-seats-container px-4 overflow-auto max-h-[calc(100vh-420px)]">
    {seats.length === 0 ? (
      <div className="empty-state-placeholder py-12 px-6 text-center">
        <p className="empty-state-text text-[13px] text-ink-muted">
          Pilih kursi yang tersedia pada denah untuk mulai memesan.
        </p>
      </div>
    ) : (
      <div className="selected-seats-list space-y-2">
        {seats.map((seat) => (
          <div key={seat.id} className="selected-seat-item flex items-center justify-between bg-panel border border-line rounded-lg px-3 py-2.5">
            <div className="item-info">
              <p className="seat-code-tag text-[12px] font-medium text-ink">{seat.tierName} - {seat.seatCode}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="item-price font-mono text-[12px] text-ink-soft">{formatRupiah(seat.price)}</span>
              <button
                onClick={() => onRemove(seat)}
                className="remove-seat-btn text-ink-muted hover:text-danger p-0.5 rounded cursor-pointer transition-colors"
                aria-label={`Hapus kursi ${seat.seatCode}`}
                title="Hapus kursi"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
