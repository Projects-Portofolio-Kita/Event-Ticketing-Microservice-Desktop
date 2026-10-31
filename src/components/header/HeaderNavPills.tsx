/**
 * @file HeaderNavPills.tsx
 * @description Renders Home quick button and global search input with category trigger.
 */
import React from 'react';
import { Home, Search, LayoutGrid } from 'lucide-react';
import { ScreenType } from '../../types/navigation';

interface NavPillsProps {
  activeScreen: ScreenType; searchQuery: string; setSearchQuery: (q: string) => void; onNavigate: (s: ScreenType) => void;
}

export const renderHeaderNavPills = ({
  activeScreen, searchQuery, setSearchQuery, onNavigate
}: NavPillsProps): React.ReactElement => (
  <div className="flex-1 flex items-center justify-center gap-2">
    <button
      onClick={() => onNavigate('discover')}
      title="Beranda"
      aria-label="Beranda"
      className={`w-12 h-12 shrink-0 rounded-full grid place-items-center transition-all hover:scale-105 cursor-pointer ${
        activeScreen === 'discover' ? 'bg-subtle text-ink' : 'bg-panel text-ink-soft hover:text-ink'
      }`}
    >
      <Home size={20} className="fill-current" />
    </button>
    <div className="flex items-center h-12 w-full max-w-[540px] rounded-full bg-panel border border-line hover:border-ink-muted focus-within:border-indigo transition-colors">
      <Search size={22} className="text-ink-muted ml-4 shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Konser, artis, festival, atau venue apa?"
        className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-ink-muted px-3 min-w-0"
        aria-label="Cari konser, artis, festival, atau venue apa?"
      />
      <div className="h-7 w-px bg-line mr-1" />
      <button
        onClick={() => onNavigate('categories')}
        title="Kategori"
        aria-label="Kategori"
        className={`w-11 h-full grid place-items-center rounded-r-full transition-colors cursor-pointer ${activeScreen === 'categories' ? 'text-indigo' : 'text-ink-muted hover:text-ink'}`}
      >
        <LayoutGrid size={20} />
      </button>
    </div>
  </div>
);
