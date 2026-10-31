/**
 * @file lock_timer_types.ts
 * @description Type definitions for countdown timer options and state returns.
 */

export interface UseLockTimerOptions {
  initialSeconds?: number;
  totalDuration?: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

export interface UseLockTimerReturn {
  seconds: number;
  formatted: string;
  percentage: number;
  isExpired: boolean;
  reset: (newSeconds?: number) => void;
}
