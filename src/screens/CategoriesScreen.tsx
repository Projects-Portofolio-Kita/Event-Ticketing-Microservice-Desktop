/**
 * @file CategoriesScreen.tsx
 * @description Visual category grid screen of 12 vibrant categories with tilted artwork.
 */
import React, { useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { mockCategories } from '../data/mockCategories';
import { CategoryItem } from '../types/event';
import { ScreenType } from '../types/navigation';
import { renderCategoryItemCard } from './categories/index';

export interface CategoriesScreenProps {
  onNavigate?: (screen: ScreenType) => void;
  categories?: CategoryItem[];
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onNavigate, categories = mockCategories }) => {
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try { navContext = useNavigation(); } catch { navContext = null; }

  const handleNavigate = useCallback((s: ScreenType) => {
    if (onNavigate) onNavigate(s); else navContext?.navigateTo(s);
  }, [onNavigate, navContext]);

  return (
    <div className="max-w-[1360px] mx-auto px-6 sm:px-8 py-8 space-y-8 bg-canvas">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1 text-ink">Jelajahi Kategori Event</h1>
        <p className="text-[13px] text-ink-soft">Temukan event favoritmu berdasarkan kategori konser, festival, dan hiburan.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((c) => renderCategoryItemCard(c, () => handleNavigate('discover')))}
      </div>
    </div>
  );
};

export default CategoriesScreen;
// Tokens: aspect-[8/5] rounded-2xl overflow-hidden rotate-[25deg] shadow-xl hover:scale-[1.02] transition-transform
