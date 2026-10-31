/**
 * @file BookingContext.tsx
 * @description Context provider and useBooking consumer hook.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Seat, BookingContextType } from '../types/seat';

export interface ExtendedBookingContextType extends BookingContextType {
  formattedLockTimer: string; isSeatSelected: (s: string) => boolean; resetTimer: () => void;
}
export interface BookingProviderProps {
  children: React.ReactNode; initialSeats?: Seat[]; onPaymentSuccess?: () => void;
}
const INITIAL_LOCK_SECONDS = 300, SERVICE_FEE = 35000;
const BookingContext = createContext<ExtendedBookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<BookingProviderProps> = ({ children, initialSeats = [], onPaymentSuccess }) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(initialSeats); const [lockTimerSeconds, setLockTimerSeconds] = useState(INITIAL_LOCK_SECONDS); const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => { const t = setInterval(() => setLockTimerSeconds((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(t); }, []);

  const resetTimer = useCallback(() => setLockTimerSeconds(INITIAL_LOCK_SECONDS), []); const isSeatSelected = useCallback((id: string) => selectedSeats.some((s) => (s.key || s.id) === id), [selectedSeats]);
  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status === 'sold' || seat.status === 'locked') return;
    const k = seat.key || seat.id;
    setSelectedSeats((prev) => prev.some((s) => (s.key || s.id) === k) ? prev.filter((s) => (s.key || s.id) !== k) : [...prev, { ...seat, status: 'selected' }]);
  }, []);

  const clearSelection = useCallback(() => setSelectedSeats([]), []); const openCheckout = useCallback(() => { if (selectedSeats.length > 0) setIsCheckoutOpen(true); }, [selectedSeats.length]);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []); const completePayment = useCallback(() => { setIsCheckoutOpen(false); onPaymentSuccess?.(); }, [onPaymentSuccess]);

  const { subtotal, tax, serviceFee, total } = useMemo(() => {
    const sub = selectedSeats.reduce((acc, s) => acc + (s.price || 0), 0);
    const tx = selectedSeats.length > 0 ? Math.round(sub * 0.1) : 0, fee = selectedSeats.length > 0 ? SERVICE_FEE : 0;
    return { subtotal: sub, tax: tx, serviceFee: fee, total: sub + tx + fee };
  }, [selectedSeats]);
  const formattedLockTimer = useMemo(() => `${String(Math.floor(lockTimerSeconds / 60)).padStart(2, '0')}:${String(lockTimerSeconds % 60).padStart(2, '0')}`, [lockTimerSeconds]);

  const value = useMemo<ExtendedBookingContextType>(() => ({
    selectedSeats, toggleSeat, clearSelection, lockTimerSeconds, subtotal, tax, serviceFee, total,
    isCheckoutOpen, openCheckout, closeCheckout, completePayment, formattedLockTimer, isSeatSelected, resetTimer,
  }), [selectedSeats, toggleSeat, clearSelection, lockTimerSeconds, subtotal, tax, serviceFee, total, isCheckoutOpen, openCheckout, closeCheckout, completePayment, formattedLockTimer, isSeatSelected, resetTimer]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
export const useBooking = (): ExtendedBookingContextType => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider');
  return ctx;
};