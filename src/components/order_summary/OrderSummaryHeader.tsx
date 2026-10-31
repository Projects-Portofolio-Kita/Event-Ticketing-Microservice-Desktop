/**
 * @file OrderSummaryHeader.tsx
 * @description Renders OrderSummary header and countdown seat lock timer card.
 */
import React from 'react';
import { formatTimer } from '../../utils/format';

interface OrderSummaryHeaderProps {
  count: number;
  activeTimerSeconds: number;
  timerPercentage: number;
}

export const renderOrderSummaryHeader = ({
  count,
  activeTimerSeconds,
  timerPercentage
}: OrderSummaryHeaderProps): React.ReactElement => (
  <div>
    <div className="summary-header p-5 border-b border-line">
      <h2 className="summary-title font-display font-bold text-[16px] text-ink">Ringkasan Pesanan</h2>
      <p className="summary-subtitle text-[12px] text-ink-soft">{count} kursi dipilih</p>
    </div>
    <div className="lock-timer-card m-4 rounded-xl bg-amber/10 border border-amber/30 p-4">
      <div className="timer-info-row flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-ink-soft">Sisa Waktu Lock Kursi</span>
        <span className="timer-countdown font-mono text-[16px] font-semibold text-amber">
          {formatTimer(activeTimerSeconds)}
        </span>
      </div>
      <div className="timer-progress-track w-full bg-amber/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="timer-progress-bar bg-amber h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${timerPercentage}%` }}
        />
      </div>
    </div>
  </div>
);
