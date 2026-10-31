/**
 * @file mock_event_details.ts
 * @description Detail concert specifications, ticket tiers, and FAQs for Coldplay event.
 */

import { TicketTierItem, ConcertMeta, FaqItem } from '../types/event';

export const mockConcertDetail: ConcertMeta = {
  title: 'Coldplay: Music of the Spheres World Tour 2026',
  artist: 'Coldplay',
  specialGuest: 'Special Guest: TBA',
  date: 'Sabtu, 14 November 2026',
  hours: 'Open Gate: 16:00 WIB · Show Starts: 19:30 WIB',
  venue: 'Stadion Utama Gelora Bung Karno, Senayan, Jakarta',
  mapsUrl: 'https://maps.google.com/?q=Gelora+Bung+Karno+Main+Stadium',
  summary: 'Coldplay kembali ke Jakarta dalam rangkaian Music of the Spheres World Tour — sebuah pertunjukan sinematik dengan panggung 360°, kembang api ramah lingkungan, dan gelang LED interaktif Xylobands untuk setiap penonton.',
  ecoHighlights: 'Konser ini mengusung inisiatif eco-friendly: panggung bertenaga sebagian dari lantai kinetik & sepeda tenaga penonton, serta program penanaman pohon untuk setiap tiket terjual.',
  posterImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=640&h=800&fit=crop&auto=format',
  priceRange: 'Rp 750.000 – Rp 3.500.000 (belum termasuk pajak 10%)'
};

export const mockTicketTiers: TicketTierItem[] = [
  { name: 'CAT 1 — VIP Soundcheck', price: 'Rp 3.500.000', status: 'Tersedia', tone: 'ok', color: '#7c3aed' },
  { name: 'CAT 2 — Festival / Free Standing', price: 'Rp 2.100.000', status: 'Sisa Sedikit', tone: 'warn', color: '#4f46e5' },
  { name: 'CAT 3 — Tribun Bawah', price: 'Rp 1.500.000', status: 'Tersedia', tone: 'ok', color: '#06b6d4' },
  { name: 'CAT 4 — Tribun Atas', price: 'Rp 750.000', status: 'Habis', tone: 'sold', color: '#94a3b8' }
];

export const mockFaqItems: FaqItem[] = [
  { q: 'Ketentuan Usia & Identitas', a: 'Pembeli wajib membawa KTP/Passport asli yang sesuai dengan nama pada tiket. Anak di bawah 12 tahun wajib didampingi orang dewasa dengan tiket terpisah.' },
  { q: 'Maksimal Pembelian', a: 'Maksimal 4 tiket per akun untuk menjaga keadilan distribusi dan mencegah aktivitas calo (scalping).' },
  { q: 'Kebijakan Refund & Reschedule', a: 'Tiket yang sudah dibeli tidak dapat dikembalikan (non-refundable), kecuali event dibatalkan oleh penyelenggara. Reschedule mengikuti kebijakan resmi promotor.' },
  { q: 'Barang yang Dilarang Masuk ke Venue', a: 'Kamera profesional, senjata tajam, minuman & makanan dari luar, serta power bank di atas 20.000mAh dilarang dibawa masuk ke area venue.' }
];
