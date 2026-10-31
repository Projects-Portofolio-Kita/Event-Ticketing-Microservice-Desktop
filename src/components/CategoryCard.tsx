/**
 * @file CategoryCard.tsx
 * @description Category card displaying name, event count, and tilted artwork image.
 */
import React from 'react';
import { CategoryItem } from '../types/event';

export interface CategoryCardProps {
  category: CategoryItem;
  onClick?: (categoryId: string) => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, className = '' }) => {
  const displayImage = category.image || category.img;
  const displayName = category.name || category.label;
  const displayCount = category.count ?? 0;

  return (
    <button
      data-testid={`category-card-${category.id}`}
      onClick={() => onClick && onClick(category.id)}
      className={`group relative aspect-[8/5] rounded-2xl overflow-hidden text-left p-4 hover:scale-[1.02] transition-transform cursor-pointer shadow-card hover:shadow-pop ${className}`}
      style={{ backgroundColor: category.color }}
      title={`Lihat kategori ${displayName}`}
      aria-label={`Kategori ${displayName}`}
    >
      {category.bgGradient && (
        <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-20 pointer-events-none`} />
      )}
      <span className="relative z-10 font-display font-bold text-[18px] text-white leading-tight block">
        {displayName}
      </span>
      <span className="relative z-10 text-[11px] font-medium text-white/80 block mt-1">
        {displayCount > 0 ? `${displayCount} Event` : 'Event Aktif'}
      </span>
      <img
        src={displayImage}
        alt={displayName}
        className="absolute -right-3 bottom-0 w-24 h-24 object-cover rounded-lg rotate-[25deg] translate-x-3 translate-y-4 shadow-xl group-hover:rotate-[18deg] group-hover:scale-105 transition-transform duration-300"
      />
    </button>
  );
};

export default CategoryCard;
