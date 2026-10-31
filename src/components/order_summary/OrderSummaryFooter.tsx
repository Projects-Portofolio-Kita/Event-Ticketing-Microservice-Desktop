/**
 * @file OrderSummaryFooter.tsx
 * @description Renders OrderSummary price breakdown and QRIS checkout button.
 */
import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

interface OrderSummaryFooterProps {
  pricing: { subtotal: number; tax: number; serviceFee: number; total: number };
  disabled: boolean;
  isLoading: boolean;
  onProceed: () => void;
}

export const renderOrderSummaryFooter = ({
  pricing,
  disabled,
  isLoading,
  onProceed
}: OrderSummaryFooterProps): React.ReactElement => (
  <div className="summary-footer p-5 border-t border-line space-y-2 mt-auto">
    <div className="pricing-breakdown space-y-2 text-[13px]">
      <div className="price-row flex items-center justify-between"><span className="text-ink-soft">Subtotal</span><span className="font-mono text-ink">{formatRupiah(pricing.subtotal)}</span></div>
      <div className="price-row flex items-center justify-between"><span className="text-ink-muted">Pajak Hiburan (10%)</span><span className="font-mono text-ink">{formatRupiah(pricing.tax)}</span></div>
      <div className="price-row flex items-center justify-between"><span className="text-ink-muted">Biaya Layanan</span><span className="font-mono text-ink">{formatRupiah(pricing.serviceFee)}</span></div>
      <div className="h-px bg-line my-1" />
      <div className="total-row flex items-center justify-between pt-1"><span className="text-[13px] font-semibold text-ink">Total</span><span className="total-val font-display text-[18px] font-bold text-ink">{formatRupiah(pricing.total)}</span></div>
    </div>
    <button
      onClick={onProceed}
      disabled={disabled}
      className={`checkout-btn w-full h-12 mt-2 grad-brand text-white font-semibold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'shadow-brand hover:brightness-110 cursor-pointer'}`}
    >
      {isLoading ? <><Loader2 size={16} className="animate-spin" /><span>Memproses...</span></> : <><span>Lanjut ke Pembayaran QRIS</span><ArrowRight size={16} /></>}
    </button>
  </div>
);
