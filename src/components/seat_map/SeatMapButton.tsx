/**
 * @file SeatMapButton.tsx
 * @description Renders individual seat button with status styling, clock/x icon, and data attributes.
 */
import React from 'react';
import { Clock, X } from 'lucide-react';
import { Seat, SeatStatus } from '../../types/seat';

export const renderSeatButton = (
  seat: Seat,
  isSelected: boolean,
  onSeatClick: (s: Seat) => void
): React.ReactElement => {
  const effectiveStatus: SeatStatus = isSelected ? 'selected' : seat.status;
  const isClickDisabled = effectiveStatus === 'locked' || effectiveStatus === 'sold';
  const statusClass = effectiveStatus === 'selected'
    ? 'seat-selected bg-indigo text-white ring-2 ring-indigo/40 pulse-indigo scale-110'
    : effectiveStatus === 'locked'
    ? 'seat-locked bg-amber bg-amber/20 cursor-not-allowed'
    : effectiveStatus === 'sold'
    ? 'seat-sold bg-sold cursor-not-allowed'
    : 'seat-available bg-emerald border border-white hover:scale-125 hover:ring-2 hover:ring-emerald/40 cursor-pointer';

  return (
    <button
      key={seat.id}
      onClick={() => onSeatClick(seat)}
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
      {effectiveStatus === 'locked' && <Clock size={8} className="text-white mx-auto" />}
      {effectiveStatus === 'sold' && <X size={8} className="text-white mx-auto" />}
    </button>
  );
};
