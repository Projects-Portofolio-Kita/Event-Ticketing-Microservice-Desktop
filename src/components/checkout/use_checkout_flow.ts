/**
 * @file use_checkout_flow.ts
 * @description Hook managing checkout state, timer, totals, and navigation handlers.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useNavigation } from '../../context/NavigationContext';
import { formatTimer, calculateOrderPricing } from '../../utils/format';
import { CheckoutModalProps } from './checkout_modal_types';

export function useCheckoutFlow(props: CheckoutModalProps) {
  let booking: ReturnType<typeof useBooking> | null = null;
  try { booking = useBooking(); } catch { booking = null; }
  let nav: ReturnType<typeof useNavigation> | null = null;
  try { nav = useNavigation(); } catch { nav = null; }
  let routerNav: ReturnType<typeof useNavigate> | null = null;
  try { routerNav = useNavigate(); } catch { routerNav = null; }

  const [localTimer, setLocalTimer] = useState(299);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setLocalTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const isVisible = props.isOpen !== undefined ? props.isOpen : (booking?.isCheckoutOpen ?? true);
  const timer = booking?.formattedLockTimer || formatTimer(localTimer);
  const seats = booking?.selectedSeats || [];
  const pricing = seats.length > 0 ? calculateOrderPricing(seats.map((s) => s.price || 0)) : calculateOrderPricing([3500000]);
  const subtotal = booking?.subtotal ?? pricing.subtotal;
  const tax = booking?.tax ?? pricing.tax;
  const serviceFee = booking?.serviceFee ?? pricing.serviceFee;
  const total = booking?.total ?? pricing.total;
  const seatLabel = seats.length > 0 ? seats.map((s) => s.key || s.id).join(', ') : 'CAT 1 VIP (C14, C15)';

  const handleClose = () => { booking?.closeCheckout(); props.onClose?.(); };
  const handleSimulate = () => {
    booking?.completePayment(); props.onSuccess?.(); routerNav?.('/tickets'); nav?.navigateTo('tickets');
  };
  const handleCancel = () => {
    booking?.clearSelection(); booking?.closeCheckout(); props.onCancel?.(); props.onClose?.();
    routerNav?.('/seatmap/coldplay-2026'); nav?.navigateTo('seatmap');
  };
  const handleDownload = () => { setDownloadSuccess(true); setTimeout(() => setDownloadSuccess(false), 2500); };

  return { isVisible, timer, subtotal, tax, serviceFee, total, seatLabel, downloadSuccess, handleClose, handleSimulate, handleCancel, handleDownload };
}
