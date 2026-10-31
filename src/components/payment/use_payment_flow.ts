/**
 * @file use_payment_flow.ts
 * @description Hook managing payment creation, simulation, and completion timeouts.
 */
import { useState, useEffect } from 'react';
import { createPayment, confirmReservation, PaymentResponse } from '../../services/api';

export function usePaymentFlow(isOpen: boolean, reservationId: string | null, onPaymentSuccess: () => void) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    if (isOpen && reservationId) {
      setIsSuccess(false); setIsLoading(true);
      createPayment(reservationId).then(setPaymentData).catch(console.error).finally(() => setIsLoading(false));
    }
  }, [isOpen, reservationId]);

  const handleSimulatePay = async () => {
    setIsLoading(true);
    try {
      if (reservationId) await confirmReservation(reservationId);
      setIsSuccess(true);
      setTimeout(() => onPaymentSuccess(), 2500);
    } catch {
      setIsSuccess(true); onPaymentSuccess();
    } finally { setIsLoading(false); }
  };

  return { isSuccess, isLoading, paymentData, handleSimulatePay };
}
