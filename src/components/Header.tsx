/**
 * @file Header.tsx
 * @description Master navigation header with brand logo, search pill, notification bell, and user menu.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Ticket, MapPin, ChevronDown, Home, Search, LayoutGrid, Bell, Receipt, Heart, Settings, CircleHelp, LogOut } from 'lucide-react';
import { mockUser } from '../data/mockUser';
import { HeaderProps, useHeaderNavigation, renderHeaderBrand, renderHeaderNavPills, renderHeaderUserMenu } from './header/index';

export { useNavigation } from '../context/NavigationContext';
export { Ticket, MapPin, ChevronDown, Home, Search, LayoutGrid, Bell, Receipt, Heart, Settings, CircleHelp, LogOut };
export type { HeaderProps };

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeScreen: pActive, active, user = mockUser }) => {
  const { activeScreen, handleNavigate } = useHeaderNavigation(onNavigate, pActive ?? active);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onDocClick = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsMenuOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="sticky top-0 h-[68px] shrink-0 bg-canvas border-b border-line flex items-center gap-4 px-6 z-40">
      {renderHeaderBrand(handleNavigate)}
      {renderHeaderNavPills({ activeScreen, searchQuery, setSearchQuery, onNavigate: handleNavigate })}
      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-subtle transition-colors cursor-pointer" title="Notifikasi" aria-label="Notifikasi">
          <Bell size={18} className="text-ink-soft" /><span className="absolute top-1 right-1 min-w-4 h-4 px-1 grid place-items-center text-[10px] font-bold text-white bg-danger rounded-full ring-2 ring-canvas">{user.unreadNotificationsCount ?? 3}</span>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsMenuOpen((p) => !p)} className="flex items-center gap-1.5 pl-0.5 pr-1.5 h-10 rounded-full hover:bg-subtle transition-colors cursor-pointer" aria-label="Profil Pengguna" title={user.name}>
            <span className="relative"><img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />{user.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald ring-2 ring-canvas" />}</span><ChevronDown size={14} className="text-ink-muted" />
          </button>
          {isMenuOpen && renderHeaderUserMenu({ user, onClose: () => setIsMenuOpen(false), onNavigate: handleNavigate })}
        </div>
      </div>
    </header>
  );
};
export default Header;
// Tokens: grad-brand text-grad-brand shadow-brand shadow-pop pop-in text-violet bg-violet/10