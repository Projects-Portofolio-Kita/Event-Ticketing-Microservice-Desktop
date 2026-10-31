/**
 * @file CheckoutModal.tsx
 * @description Master checkout modal coordinating QRIS display, order breakdown, and payment simulation.
 */
import React from 'react';
import {
  CheckoutModalProps,
  useCheckoutFlow,
  renderCheckoutModalHeader,
  renderCheckoutModalQRCol,
  renderCheckoutModalBuyerCol,
  renderCheckoutModalActions,
} from './checkout/index';

export type { CheckoutModalProps };

export const CheckoutModal: React.FC<CheckoutModalProps> = (props) => {
  const flow = useCheckoutFlow(props);
  if (!flow.isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={flow.handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="checkout-modal-card relative w-full max-w-2xl bg-canvas rounded-3xl border border-line shadow-pop overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {renderCheckoutModalHeader({ timer: flow.timer, onClose: flow.handleClose })}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-canvas">
          {renderCheckoutModalQRCol()}
          {renderCheckoutModalBuyerCol({
            user: props.user, seatLabel: flow.seatLabel, subtotal: flow.subtotal, tax: flow.tax, serviceFee: flow.serviceFee, total: flow.total
          })}
        </div>
        {renderCheckoutModalActions({
          downloadSuccess: flow.downloadSuccess, onDownload: flow.handleDownload, onSimulate: flow.handleSimulate, onCancel: flow.handleCancel
        })}
      </div>
    </div>
  );
};

export default CheckoutModal;
