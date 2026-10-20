/**
 * PriceBreakdown Component - Independent Reusable Order Pricing Breakdown
 * Displays Subtotal, 10% Entertainment Tax, Service Fee, and Grand Total
 */
import React from 'react';
import { formatRupiah, calculateOrderPricing, OrderPricing } from '../utils/format';

export interface PriceBreakdownProps {
  seatPrices?: number[];
  pricing?: Partial<OrderPricing>;
  className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  seatPrices,
  pricing: customPricing,
  className = ''
}) => {
  const calculated = seatPrices ? calculateOrderPricing(seatPrices) : null;

  const subtotal = customPricing?.subtotal ?? calculated?.subtotal ?? 0;
  const tax = customPricing?.tax ?? calculated?.tax ?? 0;
  const serviceFee = customPricing?.serviceFee ?? calculated?.serviceFee ?? 0;
  const total = customPricing?.total ?? calculated?.total ?? 0;

  return (
    <div className={`pricing-breakdown space-y-2 text-[13px] ${className}`}>
      <div className="price-row flex items-center justify-between">
        <span className="text-ink-soft">Subtotal</span>
        <span className="font-mono text-ink">{formatRupiah(subtotal)}</span>
      </div>

      <div className="price-row flex items-center justify-between">
        <span className="text-ink-muted">Pajak Hiburan (10%)</span>
        <span className="font-mono text-ink">{formatRupiah(tax)}</span>
      </div>

      <div className="price-row flex items-center justify-between">
        <span className="text-ink-muted">Biaya Layanan</span>
        <span className="font-mono text-ink">{formatRupiah(serviceFee)}</span>
      </div>

      <div className="h-px bg-line my-1" />

      <div className="total-row flex items-center justify-between pt-1">
        <span className="text-[13px] font-semibold text-ink">Total</span>
        <span className="total-val font-display text-[18px] font-bold text-ink">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
};

export default PriceBreakdown;
