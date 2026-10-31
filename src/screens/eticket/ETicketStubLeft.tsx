/**
 * @file ETicketStubLeft.tsx
 * @description Renders left stub of digital boarding pass with event metadata and buyer KYC info.
 */
import React from 'react';
import { Calendar, Clock, MapPin, ShieldCheck, Ticket } from 'lucide-react';
import { ETicketData } from '../../types/ticket';
import { mockUser } from '../../data/mockUser';

interface LeftStubProps {
  ticketData: ETicketData;
  tierName: string;
  seatsListString: string;
}

export const renderETicketStubLeft = ({
  ticketData, tierName, seatsListString
}: LeftStubProps): React.ReactElement => (
  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="px-3 py-1 rounded-full bg-violet/10 text-violet border border-violet/20 text-xs font-extrabold uppercase tracking-widest">
          VIP ALL-ACCESS PASS
        </span>
        <span className="text-xs font-mono font-bold text-ink-muted reference-id">
          {ticketData.referenceId || '#TICK-ID-98214'}
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-ink tracking-tight mb-1 event-title">
        Coldplay Music of the Spheres World Tour 2026
      </h1>
      <p className="text-xs sm:text-sm text-ink-muted mb-6">
        Special Guest: Musisi Indonesia Pilihan · Jakarta International Stadium / GBK
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-panel rounded-2xl border border-line mb-6">
        <div><div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1"><Calendar size={13} className="text-indigo" /><span>TANGGAL</span></div><div className="text-sm font-bold text-ink event-date">15 November 2026</div></div>
        <div><div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1"><Clock size={13} className="text-indigo" /><span>PINTU MASUK / GATE</span></div><div className="text-sm font-bold text-ink event-gate">Gate 3 — Buka 17:00 WIB</div></div>
        <div><div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1"><MapPin size={13} className="text-indigo" /><span>VENUE</span></div><div className="text-sm font-bold text-ink truncate event-venue">Stadion Utama Gelora Bung Karno</div></div>
        <div><div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1"><Ticket size={13} className="text-indigo" /><span>KATEGORI</span></div><div className="text-sm font-bold text-ink event-tier">{tierName}</div></div>
        <div className="col-span-2"><div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1"><Ticket size={13} className="text-indigo" /><span>NOMOR KURSI</span></div><div className="text-sm font-mono font-bold text-ink truncate event-seats">{seatsListString}</div></div>
      </div>
    </div>
    <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div><div className="text-xs text-ink-muted">Atas Nama Pemilik Tiket:</div><div className="text-sm font-bold text-ink buyer-name">{ticketData.buyer?.name || mockUser.name}</div><div className="text-xs text-ink-soft">{ticketData.buyer?.email || mockUser.email}</div></div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-xs font-bold kyc-badge w-fit"><ShieldCheck size={14} /><span>KYC Terverifikasi</span></div>
    </div>
  </div>
);
