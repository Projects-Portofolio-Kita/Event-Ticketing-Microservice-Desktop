/**
 * @file DiscoverHeroCarousel.tsx
 * @description Renders auto-rotating hero banner carousel with slide meta and navigation controls.
 */
import React from 'react';
import { Flame, ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { CarouselProps, getStartingPrice, getSlideDescription } from './discover_screen_types';

export const renderDiscoverHeroCarousel = ({
  slides, activeIndex, onPrev, onNext, onSelect, onNavigate
}: CarouselProps): React.ReactElement => (
  <section className="group relative h-[340px] rounded-[20px] overflow-hidden shadow-card">
    {slides.map((s, idx) => {
      const active = idx === activeIndex;
      const [datePart, venuePart] = (s.meta || '').split(' • ');
      return (
        <div key={s.id ?? idx} data-testid={`hero-slide-${idx}`} className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 max-w-2xl text-white">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-2 text-[12px] font-semibold bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full w-fit"><Flame size={13} className="text-coral" /><span>{s.badge}</span></span>
              <span className="sr-only">{getStartingPrice(s.id)}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-[1.08] tracking-tight mt-3 whitespace-pre-line drop-shadow-sm">{s.title}</h1>
            <div className="flex items-center gap-2 text-[14px] text-white/90 mt-2 font-medium">
              <span>{datePart || s.meta}</span>{venuePart && <><span>·</span><span>{venuePart}</span></>}
              <span className="sr-only"><Calendar size={14} /><MapPin size={14} /></span>
            </div>
            <p className="sr-only">{getSlideDescription(s.id)}</p>
            <button onClick={() => onNavigate('detail', s.id)} aria-label="Lihat Detail Event" className="grad-brand shadow-brand text-white font-medium text-[13px] h-10 px-6 rounded-full mt-4 w-fit flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer">
              <span>Lihat Detail Event</span><ArrowRight size={15} />
            </button>
          </div>
        </div>
      );
    })}
    <button onClick={onPrev} aria-label="Sebelumnya" title="Slide Sebelumnya" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer z-20"><ChevronLeft size={18} /></button>
    <button onClick={onNext} aria-label="Berikutnya" title="Slide Berikutnya" className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer z-20"><ChevronRight size={18} /></button>
    <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
      {slides.map((s, idx) => (
        <button key={s.id ?? idx} onClick={() => onSelect(idx)} aria-label={`Slide ${idx + 1}`} title={`Menuju slide ${idx + 1}`} className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`} />
      ))}
    </div>
  </section>
);
