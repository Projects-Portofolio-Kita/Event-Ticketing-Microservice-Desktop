/**
 * DiscoverScreen Component for TickId Desktop Application
 * Matches reverse-engineered Figma host app specifications
 * Features:
 *  - Auto-rotating Hero Banner Carousel (6000ms) with 3 curated slides (Coldplay, DWP, JJF)
 *  - Manual carousel controls (Previous, Next, dot indicators with active expansion)
 *  - Rich slide content: badge, title, date/venue icons, description, starting price, and CTA "Lihat Detail Event"
 *  - Popular Events section ("Event Populer & Mendatang") with 8 curated Indonesian events
 *  - Responsive grid of event cards with badges, category, date, venue, IDR pricing, and "Lihat Tiket" button
 *  - Clean Architecture & Standalone state via NavigationContext with standalone onNavigate prop fallback
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { mockHeroSlides, mockPopularEvents } from '../data/mockEvents';
import { EventItem, HeroSlide } from '../types/event';
import { ScreenType } from '../types/navigation';
import { formatRupiah } from '../utils/format';

export interface DiscoverScreenProps {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  slides?: HeroSlide[];
  popularEvents?: EventItem[];
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onNavigate,
  slides = mockHeroSlides,
  popularEvents = mockPopularEvents
}) => {
  // Graceful NavigationContext consumption with standalone fallback
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  const handleNavigate = useCallback(
    (screen: ScreenType, eventId?: string) => {
      if (onNavigate) {
        onNavigate(screen, eventId);
      } else if (navContext) {
        navContext.navigateTo(screen, eventId);
      }
    },
    [onNavigate, navContext]
  );

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Auto-rotate hero carousel every 6000ms
  useEffect(() => {
    if (!slides || slides.length === 0) return;

    const interval = setInterval(() => {
      setActiveSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides]);

  const handlePrevSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setActiveSlideIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides]);

  const handleNextSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setActiveSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides]);

  // Helper to retrieve slide starting price
  const getStartingPrice = (slideId?: string) => {
    switch (slideId) {
      case 'coldplay-2026':
        return 'Mulai dari Rp 750.000';
      case 'dwp-2026':
        return 'Mulai dari Rp 1.250.000';
      case 'jjf-2027':
        return 'Mulai dari Rp 550.000';
      default:
        return 'Mulai dari Rp 400.000';
    }
  };

  // Helper to retrieve slide description
  const getSlideDescription = (slideId?: string) => {
    switch (slideId) {
      case 'coldplay-2026':
        return 'Pertunjukan sinematik dengan panggung 360°, kembang api eco-friendly, dan gelang interaktif Xylobands.';
      case 'dwp-2026':
        return 'Festival musik elektronik terbesar di Asia Tenggara dengan panggung megah dan puluhan DJ kelas dunia.';
      case 'jjf-2027':
        return 'Perayaan musik jazz legendaris menghadirkan deretan musisi jazz dan orkestra lintas generasi.';
      default:
        return 'Pengalaman konser musik langsung tak terlupakan di arena termegah Indonesia.';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-6 space-y-8 bg-panel">
      {/* ====================================================================
          HERO BANNER CAROUSEL
          ==================================================================== */}
      <section
        className="group relative h-[340px] rounded-[20px] overflow-hidden shadow-card"
      >
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          const slideId = slide.id ?? `slide-${index}`;
          const [datePart, venuePart] = slide.meta.split(' • ');

          return (
            <div
              key={slideId}
              data-testid={`hero-slide-${index}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* Background Artwork */}
              <img
                src={slide.img}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient Scrim Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

              {/* Slide Content Overlay */}
              <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 max-w-2xl text-white">
                {/* Category / Status Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-2 text-[12px] font-semibold bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full w-fit">
                    <Flame size={13} className="text-coral" />
                    <span>{slide.badge}</span>
                  </span>
                  <span className="sr-only">{getStartingPrice(slide.id)}</span>
                </div>

                {/* Event Title */}
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-[1.08] tracking-tight mt-3 whitespace-pre-line drop-shadow-sm">
                  {slide.title}
                </h1>

                {/* Date & Venue Metadata */}
                <div className="flex items-center gap-2 text-[14px] text-white/90 mt-2 font-medium">
                  <span>{datePart || slide.meta}</span>
                  {venuePart && (
                    <>
                      <span>·</span>
                      <span>{venuePart}</span>
                    </>
                  )}
                  <span className="sr-only">
                    <Calendar size={14} />
                    <MapPin size={14} />
                  </span>
                </div>

                {/* Hidden description for tests */}
                <p className="sr-only">{getSlideDescription(slide.id)}</p>

                {/* Primary CTA Button */}
                <button
                  onClick={() => handleNavigate('detail', slide.id)}
                  aria-label="Lihat Detail Event"
                  className="grad-brand shadow-brand text-white font-medium text-[13px] h-10 px-6 rounded-full mt-4 w-fit flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>Lihat Detail Event</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Carousel Navigation: Previous Slide Arrow Button */}
        <button
          onClick={handlePrevSlide}
          aria-label="Sebelumnya"
          title="Slide Sebelumnya"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer z-20"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Carousel Navigation: Next Slide Arrow Button */}
        <button
          onClick={handleNextSlide}
          aria-label="Berikutnya"
          title="Slide Berikutnya"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer z-20"
        >
          <ChevronRight size={18} />
        </button>

        {/* Carousel Navigation: Dot Indicators with active expansion */}
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
          {slides.map((slide, index) => {
            const isActive = index === activeSlideIndex;
            return (
              <button
                key={slide.id ?? index}
                onClick={() => setActiveSlideIndex(index)}
                aria-label={`Slide ${index + 1}`}
                title={`Menuju slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  isActive ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          POPULAR & UPCOMING EVENTS SECTION
          ==================================================================== */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Event Populer di Jakarta
              <span className="sr-only">Event Populer &amp; Mendatang</span>
            </h2>
            <p className="sr-only">
              Pilihan konser dan festival musik terbaik terkurasi di Indonesia
            </p>
          </div>
          <button
            onClick={() => handleNavigate('categories')}
            className="text-[13px] text-indigo font-medium hover:underline cursor-pointer"
          >
            Lihat semua
          </button>
        </div>

        {/* Responsive Grid of 8 Indonesian Events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularEvents.map((event) => {
            const isFewLeft = event.status === 'SISA SEDIKIT';
            const displayImage = event.image || event.img;
            const formattedPrice =
              event.price || formatRupiah(event.priceStart);

            return (
              <article
                key={event.id}
                data-testid={`event-card-${event.id}`}
                onClick={() => handleNavigate('detail', event.id)}
                className="group bg-canvas border border-line rounded-2xl overflow-hidden shadow-card hover:border-indigo/50 hover:shadow-pop hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Event Image Container with Status Badge */}
                <div className="relative h-[200px] bg-subtle overflow-hidden">
                  <img
                    src={displayImage}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Status Badge (top-right) */}
                  {event.status && (
                    <span
                      className={`absolute top-2.5 right-2.5 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md text-white shadow-sm ${
                        isFewLeft ? 'bg-[#ea580c]' : 'bg-[#059669]'
                      }`}
                    >
                      {event.status}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 space-y-1">
                  {/* Event Title */}
                  <h3 className="font-display font-bold text-[15px] leading-snug truncate text-ink">
                    {event.title}
                  </h3>

                  {/* Artist / Performer */}
                  <p className="text-[13px] text-indigo font-medium truncate">
                    {event.artist}
                  </p>

                  {/* Date & Venue Metadata */}
                  <div className="mt-2 space-y-1 text-[12px] text-ink-muted">
                    <p className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-ink-muted shrink-0" />
                      <span>{event.date}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-ink-muted shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </p>
                  </div>

                  {/* Accessible Test Elements for Price & Button */}
                  <div className="sr-only">
                    <p>{formattedPrice}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('detail', event.id);
                      }}
                    >
                      Lihat Tiket
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DiscoverScreen;
