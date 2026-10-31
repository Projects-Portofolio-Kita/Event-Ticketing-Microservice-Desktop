/**
 * @file use_hero_carousel.ts
 * @description Hook managing auto-rotation timer and cycling index for hero carousel.
 */
import { useState, useEffect, useCallback } from 'react';
import { HeroSlide } from '../../types/event';

export function useHeroCarousel(slides: HeroSlide[] = []) {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  const handlePrevSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides]);

  const handleNextSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides]);

  return { activeSlideIndex, setActiveSlideIndex, handlePrevSlide, handleNextSlide };
}
