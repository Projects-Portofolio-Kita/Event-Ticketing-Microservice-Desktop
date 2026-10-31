/**
 * @file ETicketSuccessBanner.tsx
 * @description Renders return button and payment success alert banner with reference ID.
 */
import React from 'react';
import { CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ETicketData } from '../../types/ticket';

interface BannerProps {
  ticketData: ETicketData;
  onBackHome: () => void;
}

export const renderETicketSuccessBanner = ({ ticketData, onBackHome }: BannerProps): React.ReactElement => (
  <>
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBackHome}
        className="btn-back-home inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-panel hover:bg-subtle border border-line text-sm font-semibold text-ink transition-colors cursor-pointer"
        aria-label="Kembali ke Beranda"
      >
        <ArrowLeft size={16} /><span>Kembali ke Beranda</span>
      </button>
      <span className="text-xs font-mono text-ink-muted">Status: <span className="text-emerald font-bold">Terverifikasi Aktif</span></span>
    </div>
    <div className="success-alert-banner mb-6 p-4 rounded-2xl bg-emerald-tint border border-emerald/30 flex items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald/20 text-emerald flex items-center justify-center shrink-0">
          <CheckCircle size={22} />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-ink font-display flex items-center gap-2">
            <span>Pembayaran Berhasil! E-Ticket Aktif</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-white border border-emerald/20 text-emerald">{ticketData.referenceId || '#TICK-ID-98214'}</span>
          </h2>
          <p className="text-xs text-ink-muted">Tiket digital resmi telah diterbitkan dan terhubung langsung dengan sistem pintu masuk gate.</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald/20 text-xs font-bold text-emerald">
        <ShieldCheck size={14} /><span>Anti-Fraud Aktif</span>
      </div>
    </div>
  </>
);
