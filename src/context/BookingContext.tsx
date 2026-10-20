/**
 * BookingContext for TickId Desktop Application
 * Manages seat selection, real-time pricing calculation, lock timer, and checkout modal state
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Seat, BookingContextType } from '../types/seat';

const INITIAL_LOCK_SECONDS = 300; // 5 minutes lock timer
const SERVICE_FEE_AMOUNT = 35000;  // Rp 35.000 service fee per booking

export interface ExtendedBookingContextType extends BookingContextType {
  formattedLockTimer: string;
  isSeatSelected: (seatId: string) => boolean;
  resetTimer: () => void;
}

const BookingContext = createContext<ExtendedBookingContextType | undefined>(undefined);

export interface BookingProviderProps {
  children: React.ReactNode;
  initialSeats?: Seat[];
  onPaymentSuccess?: () => void;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
  initialSeats = [],
  onPaymentSuccess
}) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(initialSeats);
  const [lockTimerSeconds, setLockTimerSeconds] = useState<number>(INITIAL_LOCK_SECONDS);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // 5-minute countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLockTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const resetTimer = useCallback(() => {
    setLockTimerSeconds(INITIAL_LOCK_SECONDS);
  }, []);

  const isSeatSelected = useCallback((seatId: string) => {
    return selectedSeats.some(s => s.id === seatId || s.key === seatId);
  }, [selectedSeats]);

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status === 'sold' || seat.status === 'locked') {
      return;
    }

    setSelectedSeats(prev => {
      const seatKey = seat.key || seat.id;
      const exists = prev.some(s => (s.key || s.id) === seatKey);
      if (exists) {
        return prev.filter(s => (s.key || s.id) !== seatKey);
      } else {
        return [...prev, { ...seat, status: 'selected' }];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  const openCheckout = useCallback(() => {
    if (selectedSeats.length > 0) {
      setIsCheckoutOpen(true);
    }
  }, [selectedSeats.length]);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  const completePayment = useCallback(() => {
    setIsCheckoutOpen(false);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  }, [onPaymentSuccess]);

  // Pricing calculations
  const subtotal = useMemo(() => {
    return selectedSeats.reduce((acc, seat) => acc + (seat.price || 0), 0);
  }, [selectedSeats]);

  const tax = useMemo(() => {
    return selectedSeats.length > 0 ? Math.round(subtotal * 0.1) : 0;
  }, [subtotal, selectedSeats.length]);

  const serviceFee = useMemo(() => {
    return selectedSeats.length > 0 ? SERVICE_FEE_AMOUNT : 0;
  }, [selectedSeats.length]);

  const total = useMemo(() => {
    return subtotal + tax + serviceFee;
  }, [subtotal, tax, serviceFee]);

  const formattedLockTimer = useMemo(() => {
    const mins = Math.floor(lockTimerSeconds / 60);
    const secs = lockTimerSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [lockTimerSeconds]);

  const value = useMemo<ExtendedBookingContextType>(() => ({
    selectedSeats,
    toggleSeat,
    clearSelection,
    lockTimerSeconds,
    subtotal,
    tax,
    serviceFee,
    total,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
    completePayment,
    formattedLockTimer,
    isSeatSelected,
    resetTimer
  }), [
    selectedSeats,
    toggleSeat,
    clearSelection,
    lockTimerSeconds,
    subtotal,
    tax,
    serviceFee,
    total,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
    completePayment,
    formattedLockTimer,
    isSeatSelected,
    resetTimer
  ]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): ExtendedBookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
