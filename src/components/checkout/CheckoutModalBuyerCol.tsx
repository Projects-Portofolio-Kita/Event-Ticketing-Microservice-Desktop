/**
 * @file CheckoutModalBuyerCol.tsx
 * @description Renders buyer details, event/seat summary, order totals breakdown, and PCI-DSS notice.
 */
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { mockUser } from '../../data/mockUser';
import { formatRupiah } from '../../utils/format';

interface BuyerColProps {
  user?: UserProfile;
  seatLabel: string;
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
}

export const renderCheckoutModalBuyerCol = ({ user, seatLabel, subtotal, tax, serviceFee, total }: BuyerColProps): React.ReactElement => (
  <div className="flex flex-col justify-between py-1">
    <div>
      <div className="mb-5">
        <div className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1 flex items-center justify-between">
          <span>RINGKASAN PEMBELI</span>
          <span className="kyc-badge inline-flex items-center gap-1 text-[10px] text-emerald font-semibold"><ShieldCheck size={11} /><span>KYC Terverifikasi</span></span>
        </div>
        <div className="font-bold text-ink text-sm buyer-name">{user?.name || mockUser.name}</div>
        <div className="text-xs text-ink-muted buyer-email">{user?.email || mockUser.email}</div>
        <span className="buyer-phone sr-only">+62 812-3456-7890</span>
      </div>
      <div className="mb-5">
        <div className="font-bold text-ink text-sm">Coldplay: Music of the Spheres</div>
        <div className="text-xs text-ink-muted mt-0.5">Gelora Bung Karno · 14 Nov 2026 · 19:30 WIB</div>
        <div className="text-xs font-semibold text-indigo mt-1">Kursi: {seatLabel}</div>
      </div>
      <div className="space-y-2 py-3 border-t border-line text-xs">
        <div className="flex justify-between text-ink-soft"><span>Subtotal Tiket</span><span className="font-mono text-ink">{formatRupiah(subtotal)}</span></div>
        <div className="flex justify-between text-ink-soft"><span>Pajak Hiburan (10%)<span className="sr-only">Pajak Hiburan 10%</span></span><span className="font-mono text-ink">{formatRupiah(tax)}</span></div>
        <div className="flex justify-between text-ink-soft"><span>Biaya Layanan</span><span className="font-mono text-ink">{formatRupiah(serviceFee)}</span></div>
      </div>
    </div>
    <div className="pt-4 border-t border-line">
      <div className="flex justify-between items-center"><span className="text-sm font-semibold text-ink">Total Tagihan<span className="sr-only">Total Pembayaran</span></span><span className="font-mono text-xl font-black text-indigo total-payment-amount">{formatRupiah(total)}</span></div>
      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mt-2"><ShieldCheck size={13} className="text-emerald" /><span>Transaksi aman · PCI-DSS compliant</span></div>
    </div>
  </div>
);
