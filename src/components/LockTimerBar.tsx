/**
 * @file LockTimerBar.tsx
 * @description Countdown timer card with animated progress bar for seat reservations.
 */
import React from 'react';
import { formatTimer } from '../utils/format';

export interface LockTimerBarProps {
  seconds: number;
  totalDuration?: number;
  label?: string;
  className?: string;
}

export const LockTimerBar: React.FC<LockTimerBarProps> = ({
  seconds,
  totalDuration = 300,
  label = 'Sisa Waktu Lock Kursi',
  className = ''
}) => {
  const percentage = Math.max(0, Math.min(100, (seconds / totalDuration) * 100));

  return (
    <div className={`lock-timer-card rounded-xl bg-amber/10 border border-amber/30 p-4 ${className}`}>
      <div className="timer-info-row flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-ink-soft">{label}</span>
        <span className="timer-countdown font-mono text-[16px] font-semibold text-amber">
          {formatTimer(seconds)}
        </span>
      </div>
      <div className="timer-progress-track w-full bg-amber/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="timer-progress-bar bg-amber h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default LockTimerBar;
