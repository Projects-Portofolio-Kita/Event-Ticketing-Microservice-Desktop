/**
 * Event and Category Types for TickId Desktop Application
 */

export interface EventItem {
  id: string;
  title: string;
  artist?: string;
  category: string;
  date: string;
  time?: string;
  venue: string;
  price?: string;
  priceStart: number;
  status?: string;
  badge?: string;
  image: string;
  img?: string;
  description: string;
  isEcoFriendly?: boolean;
}

export interface HeroSlide {
  id?: string;
  badge: string;
  title: string;
  meta: string;
  img: string;
  overlay: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  label: string;
  count?: number;
  color: string;
  bgGradient?: string;
  img: string;
  image?: string;
}

export interface TicketTierItem {
  id?: string;
  name: string;
  sub?: string;
  price: number | string;
  priceLabel?: string;
  status: string;
  tone: 'ok' | 'warn' | 'sold';
  color: string;
  rows?: number;
  cols?: number;
}

export interface ConcertMeta {
  title: string;
  artist: string;
  specialGuest?: string;
  date: string;
  hours: string;
  venue: string;
  mapsUrl: string;
  summary: string;
  ecoHighlights: string;
  posterImage: string;
  priceRange: string;
}

export interface FaqItem {
  q: string;
  a: string;
}
