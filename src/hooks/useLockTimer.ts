/**
 * useLockTimer Hook - Independent Reusable Timer Hook
 * Manages countdown seconds, MM:SS formatting, and percentage progress track
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { formatTimer } from '../utils/format';

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

export function useLockTimer(options: UseLockTimerOptions = {}): UseLockTimerReturn {
  const {
    initialSeconds = 300,
    totalDuration = 300,
    onExpire,
    autoStart = true
  } = options;

  const [seconds, setSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    if (!autoStart || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoStart, seconds, onExpire]);

  const reset = useCallback((newSeconds?: number) => {
    setSeconds(newSeconds !== undefined ? newSeconds : initialSeconds);
  }, [initialSeconds]);

  const formatted = useMemo(() => formatTimer(seconds), [seconds]);

  const percentage = useMemo(() => {
    if (totalDuration <= 0) return 0;
    return Math.max(0, Math.min(100, (seconds / totalDuration) * 100));
  }, [seconds, totalDuration]);

  const isExpired = seconds <= 0;

  return {
    seconds,
    formatted,
    percentage,
    isExpired,
    reset
  };
}

export default useLockTimer;
