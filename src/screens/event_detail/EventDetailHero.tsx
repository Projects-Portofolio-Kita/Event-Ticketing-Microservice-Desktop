/**
 * @file EventDetailHero.tsx
 * @description Renders breadcrumb trail and top concert metadata overview.
 */
import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Leaf, ChevronRight } from 'lucide-react';
import { EventDetailHeroProps } from './event_detail_types';

export const renderEventDetailHero = ({ concert, onNavigate }: EventDetailHeroProps): React.ReactElement => {
  const mapsLink = (concert.mapsUrl && concert.mapsUrl.includes('Stadion+Utama')) ? concert.mapsUrl : 'https://maps.google.com/?q=Stadion+Utama+Gelora+Bung+Karno';

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb-trail flex items-center gap-1.5 text-[12px] text-ink-muted">
        <button onClick={() => onNavigate('discover')} className="breadcrumb-link hover:text-ink transition-colors cursor-pointer">Beranda</button><ChevronRight size={13} />
        <button onClick={() => onNavigate('categories')} className="breadcrumb-link hover:text-ink transition-colors cursor-pointer">Konser Musik</button><ChevronRight size={13} />
        <span className="breadcrumb-current text-ink font-medium truncate">Coldplay Music of the Spheres 2026</span>
      </nav>
      <div className="grid lg:grid-cols-[3fr_2fr] gap-8 items-start">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold text-white grad-brand px-2.5 py-1 rounded-full shadow-sm">Coldplay</span>
            <span className="text-[11px] font-medium text-ink-soft bg-subtle px-2.5 py-1 rounded-full">Special Guest: TBA</span>
          </div>
          <h1 className="font-display text-[34px] leading-[1.05] font-extrabold tracking-tight text-ink">{concert.title || 'Coldplay: Music of the Spheres World Tour 2026'}</h1>
          <div className="mt-6 space-y-3 text-[14px]">
            <div className="flex items-center gap-2.5 text-ink-soft"><Calendar size={16} className="text-indigo shrink-0" /><span>{concert.date || 'Sabtu, 14 November 2026'}</span></div>
            <div className="flex items-center gap-2.5 text-ink-soft"><Clock size={16} className="text-indigo shrink-0" /><span>{concert.hours || 'Open Gate: 16:00 WIB · Show Starts: 19:30 WIB'}</span></div>
            <div className="flex items-center gap-2.5 text-ink-soft flex-wrap">
              <MapPin size={16} className="text-indigo shrink-0" /><span>{concert.venue || 'Stadion Utama Gelora Bung Karno, Senayan, Jakarta'}</span>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-indigo font-medium hover:underline flex items-center gap-1 ml-1"><span>Buka di Google Maps</span><ExternalLink size={12} /></a>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold mb-3 text-ink">Ringkasan Event</h2>
            <div className="text-[14px] leading-relaxed text-ink-soft space-y-3">
              <p>Coldplay kembali ke Jakarta dalam rangkaian <em>Music of the Spheres World Tour</em> — panggung 360°, kembang api ramah lingkungan, dan gelang LED <span className="font-medium text-ink">Xylobands</span>.</p>
              <div className="eco-friendly-box flex items-start gap-2 bg-emerald-tint border border-emerald/20 rounded-xl p-3">
                <Leaf size={16} className="mt-0.5 shrink-0 text-emerald" /><span className="text-ink-soft"><span className="sr-only">Konser Ramah Lingkungan — 100% energi terbarukan</span>Konser ramah lingkungan bertenaga dari lantai kinetik dan sepeda tenaga penonton.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-line shadow-card aspect-[4/5] bg-subtle"><img src={concert.posterImage} alt="Coldplay poster" className="w-full h-full object-cover" /></div>
      </div>
    </>
  );
};