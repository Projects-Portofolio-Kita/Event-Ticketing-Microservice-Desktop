/**
 * @file CheckoutModalQRCol.tsx
 * @description Renders QRIS QR code container, wallet badges, and waiting payment indicator.
 */
import React from 'react';
import { Loader2 } from 'lucide-react';
import { QrCode } from '../QrCode';

export const renderCheckoutModalQRCol = (): React.ReactElement => (
  <div className="flex flex-col items-center justify-between p-4 bg-[#fbfbfe] rounded-2xl border border-line/60">
    <div className="w-full text-center mb-1">
      <div className="inline-flex items-center justify-center gap-1 text-base font-black">
        <span className="text-[#e1251b]">QR</span><span className="text-black">IS</span>
      </div>
      <p className="text-[11px] font-medium text-ink-muted mt-0.5">TickId Official Events</p>
      <p className="text-[10px] font-mono text-ink-muted">NMID: ID1020268892110</p>
    </div>
    <div className="qris-code-container my-2 p-3 bg-white rounded-2xl border border-line shadow-card flex items-center justify-center">
      <QrCode size={190} seed={21} className="w-[190px] h-[190px]" />
    </div>
    <div className="w-full flex flex-col items-center gap-1.5 my-2">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">GoPay</span>
        <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">OVO</span>
        <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">DANA</span>
        <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">BCA</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">
          <span className="sr-only">Livin&#39; Mandiri</span>Livin'
        </span>
        <span className="wallet-badge px-2.5 py-0.5 rounded-md bg-white border border-line text-[10px] font-medium text-ink-soft">ShopeePay</span>
      </div>
    </div>
    <div className="w-full py-2 px-3 rounded-xl bg-indigo/10 text-indigo text-xs font-medium flex items-center justify-center gap-2 mt-2">
      <Loader2 size={13} className="animate-spin text-indigo" />
      <span>Menunggu pembayaran… (cek otomatis)</span>
    </div>
  </div>
);
