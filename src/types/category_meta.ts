/**
 * @file category_meta.ts
 * @description Category, ticket tier, metadata, and FAQ domain interfaces.
 */

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
