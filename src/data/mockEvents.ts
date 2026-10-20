/**
 * Mock Events Data for TickId Desktop Application
 * Matches Figma host app Discover & Event Detail specifications
 */

import { EventItem, HeroSlide, TicketTierItem, ConcertMeta, FaqItem } from '../types/event';

export const mockHeroSlides: HeroSlide[] = [
  {
    id: 'coldplay-2026',
    badge: 'On Sale Now — 8.500+ antrean tiket aktif',
    title: 'COLDPLAY: Music of the Spheres\nWorld Tour 2026',
    meta: '14 November 2026 • Stadion Utama Gelora Bung Karno, Jakarta',
    img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&h=640&fit=crop&auto=format',
    overlay: 'from-[#1e1b4b]/95 via-[#312e81]/70 to-transparent'
  },
  {
    id: 'dwp-2026',
    badge: 'Presale dibuka — jangan sampai kehabisan',
    title: 'DJAKARTA WAREHOUSE\nPROJECT 2026',
    meta: '13 Desember 2026 • JIExpo Kemayoran, Jakarta',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=640&fit=crop&auto=format',
    overlay: 'from-[#4a044e]/95 via-[#701a75]/60 to-transparent'
  },
  {
    id: 'jjf-2027',
    badge: 'Tiket terbatas — segera amankan kursimu',
    title: 'JAKARTA JAZZ\nFESTIVAL 2027',
    meta: '6 Februari 2027 • Gambir Expo, Kemayoran',
    img: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&h=640&fit=crop&auto=format',
    overlay: 'from-[#083344]/95 via-[#155e75]/60 to-transparent'
  }
];

export const mockPopularEvents: EventItem[] = [
  {
    id: 'ethereal-nights',
    title: 'Ethereal Nights',
    artist: 'Tulus',
    category: 'Konser',
    date: '5 Des 2026',
    venue: 'Istora Senayan, Jakarta',
    price: 'Rp 450.000',
    priceStart: 450000,
    status: 'PRESALE AKTIF',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=560&h=380&fit=crop&auto=format',
    description: 'Tur konser solo Tulus dengan visual tata panggung megah di Istora Senayan.'
  },
  {
    id: 'dwp-2026',
    title: 'Djakarta Warehouse Project',
    artist: 'Various Artists',
    category: 'Festival',
    date: '13 Des 2026',
    venue: 'JIExpo Kemayoran',
    price: 'Rp 1.250.000',
    priceStart: 1250000,
    status: 'SISA SEDIKIT',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=560&h=380&fit=crop&auto=format',
    description: 'Festival musik elektronik terbesar di Asia Tenggara dengan DJ kelas dunia.'
  },
  {
    id: 'eras-experience',
    title: 'The Eras Experience',
    artist: 'Symphony Orchestra',
    category: 'Konser',
    date: '18 Jan 2027',
    venue: 'Ciputra Artpreneur',
    price: 'Rp 680.000',
    priceStart: 680000,
    status: 'PRESALE AKTIF',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=560&h=380&fit=crop&auto=format',
    description: 'Penampilan orkestra simfoni memainkan aransemen lagu-lagu ikonik modern.'
  },
  {
    id: 'jjf-2027',
    title: 'Jakarta Jazz Festival',
    artist: 'Various Legends',
    category: 'Jazz & Klasik',
    date: '6 Feb 2027',
    venue: 'Gambir Expo, Kemayoran',
    price: 'Rp 550.000',
    priceStart: 550000,
    status: 'SISA SEDIKIT',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=560&h=380&fit=crop&auto=format',
    description: 'Perayaan musik jazz legendaris menghadirkan musisi lintas generasi.'
  },
  {
    id: 'neon-circuit',
    title: 'Neon Circuit Rave',
    artist: 'Alan Walker',
    category: 'EDM & Electronic',
    date: '14 Mar 2027',
    venue: 'Community Park, PIK',
    price: 'Rp 850.000',
    priceStart: 850000,
    status: 'PRESALE AKTIF',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=560&h=380&fit=crop&auto=format',
    description: 'Rave outdoor futuristik di pinggir pantai PIK dengan tata cahaya spektakuler.'
  },
  {
    id: 'derby-ibukota',
    title: 'Derby Ibu Kota',
    artist: 'Persija vs Persib',
    category: 'Olahraga',
    date: '22 Mar 2027',
    venue: 'GBK Main Stadium',
    price: 'Rp 300.000',
    priceStart: 300000,
    status: 'PRESALE AKTIF',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=560&h=380&fit=crop&auto=format',
    description: 'Laga el-clasico Indonesia sarat gengsi di Stadion Utama Gelora Bung Karno.'
  },
  {
    id: 'soundrenaline-2027',
    title: 'Soundrenaline 2027',
    artist: 'Various Artists',
    category: 'Festival',
    date: '11 Apr 2027',
    venue: 'Garuda Wisnu Kencana, Bali',
    price: 'Rp 975.000',
    priceStart: 975000,
    status: 'PRESALE AKTIF',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=560&h=380&fit=crop&auto=format',
    description: 'Festival multi-genre terbesar dengan lanskap tebing kapur ikonik GWK Bali.'
  },
  {
    id: 'beethoven-night',
    title: 'Klasik: Beethoven Night',
    artist: 'Jakarta Concert Orchestra',
    category: 'Jazz & Klasik',
    date: '3 Mei 2027',
    venue: 'Aula Simfonia Jakarta',
    price: 'Rp 400.000',
    priceStart: 400000,
    status: 'SISA SEDIKIT',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=560&h=380&fit=crop&auto=format',
    img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=560&h=380&fit=crop&auto=format',
    description: 'Persembahan mahakarya simfoni Beethoven dalam akustik kelas dunia Aula Simfonia.'
  }
];

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
  {
    q: 'Ketentuan Usia & Identitas',
    a: 'Pembeli wajib membawa KTP/Passport asli yang sesuai dengan nama pada tiket. Anak di bawah 12 tahun wajib didampingi orang dewasa dengan tiket terpisah.'
  },
  {
    q: 'Maksimal Pembelian',
    a: 'Maksimal 4 tiket per akun untuk menjaga keadilan distribusi dan mencegah aktivitas calo (scalping).'
  },
  {
    q: 'Kebijakan Refund & Reschedule',
    a: 'Tiket yang sudah dibeli tidak dapat dikembalikan (non-refundable), kecuali event dibatalkan oleh penyelenggara. Reschedule mengikuti kebijakan resmi promotor.'
  },
  {
    q: 'Barang yang Dilarang Masuk ke Venue',
    a: 'Kamera profesional, senjata tajam, minuman & makanan dari luar, serta power bank di atas 20.000mAh dilarang dibawa masuk ke area venue.'
  }
];
