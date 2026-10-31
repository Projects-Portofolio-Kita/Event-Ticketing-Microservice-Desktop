/**
 * @file PaymentModal.tsx
 * @description QRIS payment workflow dialog with simulation callbacks.
 */
import { type FC } from 'react';
import { X } from 'lucide-react';
import { SelectedSeat } from '../types/booking';
import { PaymentSuccessView, PaymentQRView, usePaymentFlow } from './payment/index';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: SelectedSeat[];
  reservationId: string | null;
  bookingRef: string | null;
  onPaymentSuccess: () => void;
}

export const PaymentModal: FC<PaymentModalProps> = ({
  isOpen, onClose, selectedSeats, reservationId, bookingRef, onPaymentSuccess,
}) => {
  const { isSuccess, isLoading, paymentData, handleSimulatePay } = usePaymentFlow(isOpen, reservationId, onPaymentSuccess);
  if (!isOpen) return null;

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const total = subtotal + Math.round(subtotal * 0.1);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose} disabled={isLoading}><X size={20} /></button>
        {!isSuccess ? (
          <PaymentQRView isLoading={isLoading} total={total} paymentData={paymentData} bookingRef={bookingRef} selectedSeats={selectedSeats} onSimulatePay={handleSimulatePay} />
        ) : (
          <PaymentSuccessView bookingRef={bookingRef} seatCount={selectedSeats.length} total={total} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
