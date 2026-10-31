/**
 * @file HeaderBrand.tsx
 * @description Renders brand logo link and location selector for Header.
 */
import React from 'react';
import { Ticket, MapPin, ChevronDown } from 'lucide-react';
import { ScreenType } from '../../types/navigation';

export const renderHeaderBrand = (onNavigate: (s: ScreenType) => void): React.ReactElement => (
  <div className="flex items-center gap-4">
    <button onClick={() => onNavigate('discover')} className="flex items-center gap-2 cursor-pointer focus:outline-none" title="TickId Beranda" aria-label="TickId Beranda">
      <div className="grad-brand w-7 h-7 rounded-lg grid place-items-center shadow-brand"><Ticket size={15} className="text-white" strokeWidth={2.5} /></div>
      <span className="font-display font-extrabold tracking-tight text-[16px] text-ink">Tick<span className="text-grad-brand">Id</span></span>
    </button>
    <button className="flex items-center gap-1 h-8 pl-2 pr-2.5 rounded-full text-[13px] text-ink-soft hover:bg-subtle transition-colors cursor-pointer" title="Pilih Lokasi" aria-label="Pilih Lokasi: Jakarta, ID">
      <MapPin size={14} className="text-indigo" /><span> Jakarta, ID</span><ChevronDown size={13} className="text-ink-muted" />
    </button>
  </div>
);
