/**
 * EventDetailScreen Component for TickId Desktop Application
 * Matches reverse-engineered Figma host app specifications
 * Features:
 *  - Breadcrumb navigation trail (Beranda > Konser Musik > Coldplay Music of the Spheres 2026)
 *  - Concert metadata: Title, Date, Gate & Show time, Venue with external Google Maps link
 *  - Rich event summary and Eco-Friendly Highlights badge
 *  - Ticket categories table/list (CAT 1 - CAT 4) with prices and status pills
 *  - Crude / stylized stage layout diagram (PANGGUNG UTAMA / STAGE & tier blocks)
 *  - Terms & FAQ accordion (4 toggleable items with +/- icons)
 *  - Sticky bottom booking bar with price range and primary CTA "Pilih Kursi Sekarang"
 *  - Clean Architecture & Standalone state via NavigationContext with standalone onNavigate fallback
 */

import React, { useState, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Leaf,
  Plus,
  Minus,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { mockConcertDetail, mockTicketTiers, mockFaqItems } from '../data/mockEvents';
import { ConcertMeta, TicketTierItem, FaqItem } from '../types/event';
import { ScreenType } from '../types/navigation';
import { formatRupiah } from '../utils/format';

export interface EventDetailScreenProps {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  concert?: ConcertMeta;
  ticketTiers?: TicketTierItem[];
  faqItems?: FaqItem[];
  eventId?: string;
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  onNavigate,
  concert = mockConcertDetail,
  ticketTiers = mockTicketTiers,
  faqItems = mockFaqItems,
  eventId
}) => {
  // Graceful NavigationContext consumption with standalone fallback
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  const handleNavigate = useCallback(
    (screen: ScreenType, targetEventId?: string) => {
      if (onNavigate) {
        onNavigate(screen, targetEventId || eventId);
      } else if (navContext) {
        navContext.navigateTo(screen, targetEventId || eventId);
      }
    },
    [onNavigate, navContext, eventId]
  );

  // Accordion state: set of open FAQ indices (default first item open)
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const mapsLink =
    (concert.mapsUrl && concert.mapsUrl.includes('Stadion+Utama'))
      ? concert.mapsUrl
      : 'https://maps.google.com/?q=Stadion+Utama+Gelora+Bung+Karno';

  return (
    <div className="event-detail-screen w-full min-h-screen bg-canvas text-ink relative">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-8 pb-32 space-y-10">
        {/* Breadcrumb Navigation Trail */}
        <nav
          aria-label="Breadcrumb"
          className="breadcrumb-trail flex items-center gap-1.5 text-[12px] text-ink-muted"
        >
          <button
            onClick={() => handleNavigate('discover')}
            className="breadcrumb-link hover:text-ink transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <ChevronRight size={13} />
          <button
            onClick={() => handleNavigate('categories')}
            className="breadcrumb-link hover:text-ink transition-colors cursor-pointer"
          >
            Konser Musik
          </button>
          <ChevronRight size={13} />
          <span className="breadcrumb-current text-ink font-medium truncate">
            Coldplay Music of the Spheres 2026
          </span>
        </nav>

        {/* Hero Top Grid: Details (Left) + Large Image (Right) */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-8 items-start">
          <div>
            {/* Pill Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-semibold text-white grad-brand px-2.5 py-1 rounded-full shadow-sm">
                Coldplay
              </span>
              <span className="text-[11px] font-medium text-ink-soft bg-subtle px-2.5 py-1 rounded-full">
                Special Guest: TBA
              </span>
            </div>

            {/* Concert Title */}
            <h1 className="font-display text-[34px] leading-[1.05] font-extrabold tracking-tight text-ink">
              {concert.title || 'Coldplay: Music of the Spheres World Tour 2026'}
            </h1>

            {/* Metadata Rows */}
            <div className="mt-6 space-y-3 text-[14px]">
              <div className="flex items-center gap-2.5 text-ink-soft">
                <Calendar size={16} className="text-indigo shrink-0" />
                <span>{concert.date || 'Sabtu, 14 November 2026'}</span>
              </div>

              <div className="flex items-center gap-2.5 text-ink-soft">
                <Clock size={16} className="text-indigo shrink-0" />
                <span>{concert.hours || 'Open Gate: 16:00 WIB · Show Starts: 19:30 WIB'}</span>
              </div>

              <div className="flex items-center gap-2.5 text-ink-soft flex-wrap">
                <MapPin size={16} className="text-indigo shrink-0" />
                <span>{concert.venue || 'Stadion Utama Gelora Bung Karno, Senayan, Jakarta'}</span>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo font-medium hover:underline flex items-center gap-1 ml-1"
                >
                  <span>Lihat di Google Maps</span>
                  <span className="sr-only">Buka di Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Ringkasan Event Section */}
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold mb-3 text-ink">
                Ringkasan Event
              </h2>
              <div className="text-[14px] leading-relaxed text-ink-soft space-y-3">
                <p>
                  Coldplay kembali ke Jakarta dalam rangkaian <em>Music of the Spheres World Tour</em> — sebuah pertunjukan sinematik dengan panggung 360°, kembang api ramah lingkungan, dan gelang LED interaktif <span className="font-medium text-ink">Xylobands</span> untuk setiap penonton.
                </p>
                <div className="eco-friendly-box flex items-start gap-2 bg-emerald-tint border border-emerald/20 rounded-xl p-3">
                  <Leaf size={16} className="mt-0.5 shrink-0 text-emerald" />
                  <span className="text-ink-soft">
                    <span className="sr-only">Konser Ramah Lingkungan — 100% energi terbarukan</span>
                    <span className="sr-only">Konser Ramah Lingkungan - 100% energi terbarukan</span>
                    Konser ini mengusung inisiatif <span className="font-medium text-ink">eco-friendly</span>: panggung bertenaga sebagian dari lantai kinetik &amp; sepeda tenaga penonton, serta program penanaman pohon untuk setiap tiket terjual.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Concert Poster */}
          <div className="rounded-2xl overflow-hidden border border-line shadow-card aspect-[4/5] bg-subtle">
            <img
              src={concert.posterImage}
              alt="Coldplay poster"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Kategori Tiket & Denah Kasar Section */}
        <section className="pt-2">
          <h2 className="font-display text-xl font-bold mb-4 text-ink">
            Kategori Tiket &amp; Denah Kasar
          </h2>
          <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-start">
            {/* Left Column: Tiers Cards List */}
            <div className="space-y-2.5">
              {ticketTiers.map((e) => {
                const toneClass =
                  e.tone === 'sold' || e.status === 'Habis'
                    ? 'text-ink-muted bg-subtle line-through'
                    : e.tone === 'warn' || e.status === 'Sisa Sedikit'
                    ? 'text-amber bg-amber/10'
                    : 'text-emerald bg-emerald-tint';

                const priceStr =
                  typeof e.price === 'number'
                    ? formatRupiah(e.price)
                    : e.price;

                return (
                  <div
                    key={e.name}
                    className="ticket-tier-item flex items-center justify-between bg-panel border border-line rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: e.color }}
                      />
                      <span className="text-[14px] font-medium text-ink">{e.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-[14px] text-ink">
                        {priceStr}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${toneClass}`}>
                        {e.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Schematic Stage Layout Box */}
            <div className="rounded-2xl border border-line bg-panel p-6 grid place-items-center">
              <div className="w-full max-w-xs">
                <div className="h-8 rounded-t-[100%] grid place-items-center text-[10px] font-semibold tracking-[0.25em] text-indigo bg-indigo/10 border border-indigo/20 border-b-0">
                  <span className="sr-only">PANGGUNG UTAMA / STAGE</span>
                  PANGGUNG
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#7c3aed]">
                    CAT 1
                  </div>
                  <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#4f46e5]">
                    CAT 2
                  </div>
                  <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#06b6d4]">
                    CAT 3
                  </div>
                  <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#94a3b8] opacity-40">
                    CAT 4
                  </div>
                </div>
                <p className="denah-disclaimer text-[11px] text-ink-muted text-center mt-3">
                  Denah kasar · tidak sesuai skala
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ketentuan & Syarat Pembelian Section */}
        <section className="pt-2">
          <h2 className="font-display text-xl font-bold mb-4 text-ink">
            Ketentuan &amp; Syarat Pembelian
          </h2>
          <div className="faq-list max-w-3xl divide-y divide-line border border-line rounded-2xl overflow-hidden bg-canvas">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndices.includes(idx);
              return (
                <div key={faq.q || idx} className="faq-accordion-item">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="faq-header-btn w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-panel transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question text-[14px] font-medium text-ink">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <Minus size={16} className="faq-toggle-minus text-indigo shrink-0" />
                    ) : (
                      <Plus size={16} className="faq-toggle-plus text-ink-muted shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <p className="faq-answer-body px-5 pb-4 text-[13px] leading-relaxed text-ink-soft">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <aside className="sticky-booking-bar sticky bottom-0 h-[76px] bg-canvas/95 backdrop-blur-md border-t border-line flex items-center justify-between px-8 z-30 shadow-card">
        <p className="text-[13px] text-ink-soft">
          Harga mulai <span className="price-range-text font-semibold text-ink">Rp 750.000 – Rp 3.500.000</span>{' '}
          <span className="text-ink-muted">(belum termasuk pajak 10%)</span>
        </p>

        <button
          onClick={() => handleNavigate('seatmap')}
          className="btn-pilih-kursi grad-brand shadow-brand text-white font-semibold text-[16px] h-12 px-7 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
        >
          <span>Pilih Kursi Sekarang</span>
          <ArrowRight size={18} />
        </button>
      </aside>
    </div>
  );
};

export default EventDetailScreen;
