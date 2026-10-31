/**
 * @file discover_screen_types.ts
 * @description Type definitions and descriptions for DiscoverScreen.
 */
import { EventItem, HeroSlide } from '../../types/event';
import { ScreenType } from '../../types/navigation';

export interface DiscoverScreenProps {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  slides?: HeroSlide[];
  popularEvents?: EventItem[];
}

export interface CarouselProps {
  slides: HeroSlide[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
  onNavigate: (s: ScreenType, id?: string) => void;
}

export function getStartingPrice(slideId?: string): string {
  if (slideId === 'coldplay-2026') return 'Mulai dari Rp 750.000';
  if (slideId === 'dwp-2026') return 'Mulai dari Rp 1.250.000';
  if (slideId === 'jjf-2027') return 'Mulai dari Rp 550.000';
  return 'Mulai dari Rp 400.000';
}

export function getSlideDescription(slideId?: string): string {
  if (slideId === 'coldplay-2026') return 'Pertunjukan sinematik dengan panggung 360°, kembang api eco-friendly, dan gelang interaktif Xylobands.';
  if (slideId === 'dwp-2026') return 'Festival musik elektronik terbesar di Asia Tenggara dengan panggung megah dan puluhan DJ kelas dunia.';
  if (slideId === 'jjf-2027') return 'Perayaan musik jazz legendaris menghadirkan deretan musisi jazz dan orkestra lintas generasi.';
  return 'Pengalaman konser musik langsung tak terlupakan di arena termegah Indonesia.';
}
