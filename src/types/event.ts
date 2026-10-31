/**
 * @file event.ts
 * @description Event and hero banner models with category re-exports.
 */

export * from './category_meta';

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
