/**
 * @file SeatMapRow.tsx
 * @description Renders seat rows organized by row letters and left/right aisle blocks.
 */
import React from 'react';
import { Seat } from '../../types/seat';
import { renderSeatButton } from './SeatMapButton';

export { renderSeatButton };

export const renderTierRows = (
  tierSeats: Seat[],
  selectedIds: Set<string>,
  onSeatClick: (s: Seat) => void
): React.ReactElement => {
  const rowMap: Record<string, Seat[]> = {};
  tierSeats.forEach((s) => { (rowMap[s.row] = rowMap[s.row] || []).push(s); });

  return (
    <div className="tier-seat-rows flex flex-col items-center gap-1.5 py-3 rounded-xl bg-canvas border border-line">
      {Object.keys(rowMap).sort().map((r) => (
        <div key={r} className="seat-row-container flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5">
            {rowMap[r].filter((s) => s.number <= 9).map((s) =>
              renderSeatButton(s, selectedIds.has(s.id) || selectedIds.has(s.key || ''), onSeatClick)
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {rowMap[r].filter((s) => s.number > 9).map((s) =>
              renderSeatButton(s, selectedIds.has(s.id) || selectedIds.has(s.key || ''), onSeatClick)
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
