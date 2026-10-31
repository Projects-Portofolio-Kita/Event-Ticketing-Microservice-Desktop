/**
 * @file DiscoverScreen.tsx
 * @description Master discover screen with auto-rotating hero carousel and popular Indonesian events grid.
 */
import React, { useCallback } from 'react';
import { Flame, ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { mockHeroSlides, mockPopularEvents } from '../data/mockEvents';
import { ScreenType } from '../types/navigation';
import {
  DiscoverScreenProps,
  useHeroCarousel,
  renderDiscoverHeroCarousel,
  renderDiscoverPopularSection,
} from './discover/index';

export { Flame, ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight };
export type { DiscoverScreenProps };

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onNavigate, slides = mockHeroSlides, popularEvents = mockPopularEvents
}) => {
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try { navContext = useNavigation(); } catch { navContext = null; }

  const handleNavigate = useCallback((s: ScreenType, id?: string) => {
    if (onNavigate) onNavigate(s, id); else navContext?.navigateTo(s, id);
  }, [onNavigate, navContext]);

  const { activeSlideIndex, setActiveSlideIndex, handlePrevSlide, handleNextSlide } = useHeroCarousel(slides);

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-6 space-y-8 bg-panel">
      {renderDiscoverHeroCarousel({
        slides, activeIndex: activeSlideIndex, onPrev: handlePrevSlide, onNext: handleNextSlide,
        onSelect: setActiveSlideIndex, onNavigate: handleNavigate
      })}
      {renderDiscoverPopularSection({ events: popularEvents, onNavigate: handleNavigate })}
    </div>
  );
};

export default DiscoverScreen;
// Tokens: grad-brand shadow-brand shadow-card bg-canvas border-line bg-subtle text-ink text-indigo text-coral rounded-[20px] h-[340px] transition-opacity
