/**
 * @file api_payment.ts
 * @description QRIS payment creation endpoint caller with fallback simulation.
 */

import { PAYMENT_BASE_URL } from './api_config';
import { PaymentResponse } from './api_types';

export async function createPayment(reservationId: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${PAYMENT_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservation_id: reservationId, payment_method: 'qris' }),
    });
    if (response.ok) return { ...(await response.json()), isMock: false };
  } catch (error) {
    console.warn('[TickId API] Live Payment Service not connected, running simulated payment.', error);
  }

  return {
    id: 'pay-' + Date.now(),
    reservation_id: reservationId,
    qr_string: '00020101021226600016ID.CO.TICKID.WWW01189360099800000000005204581253033605802ID5914TICKID CONCERT6007JAKARTA6304ABCD',
    qr_url: '',
    status: 'PENDING',
    expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    amount: 0,
    currency: 'IDR',
    isMock: true,
  };
}
