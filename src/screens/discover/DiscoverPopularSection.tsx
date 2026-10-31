/**
 * @file DiscoverPopularSection.tsx
 * @description Renders popular upcoming events header and responsive 4-column event cards grid.
 */
import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { EventItem } from '../../types/event';
import { ScreenType } from '../../types/navigation';
import { formatRupiah } from '../../utils/format';

interface PopularProps {
  events: EventItem[];
  onNavigate: (s: ScreenType, id?: string) => void;
}

export const renderDiscoverPopularSection = ({ events, onNavigate }: PopularProps): React.ReactElement => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Event Populer di Jakarta<span className="sr-only">Event Populer &amp; Mendatang</span></h2>
        <p className="sr-only">Pilihan konser dan festival musik terbaik terkurasi di Indonesia</p>
      </div>
      <button onClick={() => onNavigate('categories')} className="text-[13px] text-indigo font-medium hover:underline cursor-pointer">Lihat semua</button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {events.map((e) => {
        const isFew = e.status === 'SISA SEDIKIT';
        const formattedPrice = e.price || formatRupiah(e.priceStart);
        return (
          <article key={e.id} data-testid={`event-card-${e.id}`} onClick={() => onNavigate('detail', e.id)} className="group bg-canvas border border-line rounded-2xl overflow-hidden shadow-card hover:border-indigo/50 hover:shadow-pop hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
            <div className="relative h-[200px] bg-subtle overflow-hidden">
              <img src={e.image || e.img} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {e.status && <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md text-white shadow-sm ${isFew ? 'bg-[#ea580c]' : 'bg-[#059669]'}`}>{e.status}</span>}
            </div>
            <div className="p-4 flex flex-col flex-1 space-y-1">
              <h3 className="font-display font-bold text-[15px] leading-snug truncate text-ink">{e.title}</h3>
              <p className="text-[13px] text-indigo font-medium truncate">{e.artist}</p>
              <div className="mt-2 space-y-1 text-[12px] text-ink-muted">
                <p className="flex items-center gap-1.5"><Calendar size={13} className="text-ink-muted shrink-0" /><span>{e.date}</span></p>
                <p className="flex items-center gap-1.5 truncate"><MapPin size={13} className="text-ink-muted shrink-0" /><span className="truncate">{e.venue}</span></p>
              </div>
              <div className="sr-only"><p>{formattedPrice}</p><button onClick={(ev) => { ev.stopPropagation(); onNavigate('detail', e.id); }}>Lihat Tiket</button></div>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);
