/**
 * CategoriesScreen Component for TickId Desktop Application
 * Matches reverse-engineered Figma host app specifications
 * Features:
 *  - Visual category grid of 12 vibrant categories
 *  - Header with title "Jelajahi Kategori Event" and descriptive subtitle
 *  - Rich cards with category name, event count, custom colored backgrounds, and tilted artwork
 *  - 25-degree rotated artwork image with overflow clipping and hover zoom interaction
 *  - Clicking any category routes cleanly to 'discover'
 *  - Standalone state via NavigationContext with standalone onNavigate fallback
 */

import React, { useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { mockCategories } from '../data/mockCategories';
import { CategoryItem } from '../types/event';
import { ScreenType } from '../types/navigation';

export interface CategoriesScreenProps {
  onNavigate?: (screen: ScreenType) => void;
  categories?: CategoryItem[];
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onNavigate,
  categories = mockCategories
}) => {
  // Graceful NavigationContext consumption with standalone fallback
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  const handleNavigate = useCallback(
    (screen: ScreenType) => {
      if (onNavigate) {
        onNavigate(screen);
      } else if (navContext) {
        navContext.navigateTo(screen);
      }
    },
    [onNavigate, navContext]
  );

  return (
    <div className="max-w-[1360px] mx-auto px-6 sm:px-8 py-8 space-y-8 bg-canvas">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1 text-ink">
          Jelajahi Kategori Event
        </h1>
        <p className="text-[13px] text-ink-soft">
          Temukan event favoritmu berdasarkan kategori konser, festival, dan hiburan.
        </p>
      </div>

      {/* 12 Category Visual Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((category) => {
          const displayImage = category.image || category.img;
          const displayName = category.name || category.label;
          const displayCount = category.count ?? 0;

          return (
            <button
              key={category.id}
              data-testid={`category-card-${category.id}`}
              onClick={() => handleNavigate('discover')}
              className="group relative aspect-[8/5] rounded-2xl overflow-hidden text-left p-4 hover:scale-[1.02] transition-transform cursor-pointer shadow-card hover:shadow-pop"
              style={{ backgroundColor: category.color }}
              title={`Lihat kategori ${displayName}`}
              aria-label={`Kategori ${displayName}`}
            >
              {/* Subtle Gradient Scrim if available */}
              {category.bgGradient && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-20 pointer-events-none`}
                />
              )}

              {/* Category Name */}
              <span className="relative z-10 font-display font-bold text-[18px] text-white leading-tight block">
                {displayName}
              </span>

              {/* Event Count Indicator */}
              <span className="relative z-10 text-[11px] font-medium text-white/80 block mt-1">
                {displayCount > 0 ? `${displayCount} Event` : 'Event Aktif'}
              </span>

              {/* Tilted Artwork Image with 25deg rotation & hover zoom effect */}
              <img
                src={displayImage}
                alt={displayName}
                className="absolute -right-3 bottom-0 w-24 h-24 object-cover rounded-lg rotate-[25deg] translate-x-3 translate-y-4 shadow-xl group-hover:rotate-[18deg] group-hover:scale-105 transition-transform duration-300"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesScreen;
