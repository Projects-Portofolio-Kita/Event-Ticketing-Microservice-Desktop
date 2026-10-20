/**
 * Header Component for TickId Desktop Application
 * Matches reverse-engineered specifications from Figma host app (https://mop-lion-37118726.figma.site)
 * Clean Architecture & Standalone Client State via NavigationContext and mockUser
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Ticket,
  MapPin,
  ChevronDown,
  Home,
  Search,
  LayoutGrid,
  Bell,
  Receipt,
  Heart,
  Settings,
  CircleHelp,
  LogOut
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { mockUser } from '../data/mockUser';
import { ScreenType } from '../types/navigation';
import { UserProfile } from '../types/user';

export interface HeaderProps {
  onNavigate?: (screen: ScreenType) => void;
  activeScreen?: ScreenType;
  active?: ScreenType; // Alias for activeScreen
  user?: UserProfile;
}

interface MenuItemProps {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  badge?: string;
  danger?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  badge,
  danger = false,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 h-10 px-3 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
        danger
          ? 'text-danger hover:bg-danger/10'
          : 'text-ink-soft hover:bg-subtle hover:text-ink'
      }`}
    >
      <Icon size={16} className={danger ? 'text-danger' : 'text-ink-muted'} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="text-[10px] font-semibold text-indigo bg-indigo/10 rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  activeScreen: propActiveScreen,
  active: propActive,
  user = mockUser
}) => {
  // Gracefully attempt using react-router-dom if available in Router context
  let routerNavigate: ReturnType<typeof useNavigate> | null = null;
  let routerLocation: ReturnType<typeof useLocation> | null = null;
  try {
    routerNavigate = useNavigate();
  } catch {
    routerNavigate = null;
  }
  try {
    routerLocation = useLocation();
  } catch {
    routerLocation = null;
  }

  // Gracefully attempt using NavigationContext if available
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  const activeFromLocation = routerLocation ? (() => {
    const path = routerLocation.pathname;
    if (path === '/' || path === '/discover') return 'discover';
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/event')) return 'detail';
    if (path.startsWith('/seatmap')) return 'seatmap';
    if (path.startsWith('/tickets')) return 'tickets';
    return 'discover';
  })() : null;

  const activeScreen = propActiveScreen ?? propActive ?? activeFromLocation ?? navContext?.activeScreen ?? 'discover';

  const handleNavigate = (screen: ScreenType) => {
    if (onNavigate) {
      onNavigate(screen);
    } else if (routerNavigate) {
      switch (screen) {
        case 'discover':
          routerNavigate('/');
          break;
        case 'categories':
          routerNavigate('/categories');
          break;
        case 'detail':
          routerNavigate('/event/coldplay-2026');
          break;
        case 'seatmap':
          routerNavigate('/seatmap/coldplay-2026');
          break;
        case 'tickets':
          routerNavigate('/tickets');
          break;
        default:
          routerNavigate('/');
      }
      if (navContext) {
        navContext.navigateTo(screen);
      }
    } else if (navContext) {
      navContext.navigateTo(screen);
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Outside click handler to dismiss the profile popover dropdown
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 h-[68px] shrink-0 bg-canvas border-b border-line flex items-center gap-4 px-6 z-40">
      {/* Left side: Brand Logo & Location Selector */}
      <div className="flex items-center gap-4">
        {/* Brand Logo Button */}
        <button
          onClick={() => handleNavigate('discover')}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
          title="TickId Beranda"
          aria-label="TickId Beranda"
        >
          <div className="grad-brand w-7 h-7 rounded-lg grid place-items-center shadow-brand">
            <Ticket size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold tracking-tight text-[16px] text-ink">
            Tick<span className="text-grad-brand">Id</span>
          </span>
        </button>

        {/* Location Selector Pill */}
        <button
          className="flex items-center gap-1 h-8 pl-2 pr-2.5 rounded-full text-[13px] text-ink-soft hover:bg-subtle transition-colors cursor-pointer"
          title="Pilih Lokasi"
          aria-label="Pilih Lokasi: Jakarta, ID"
        >
          <MapPin size={14} className="text-indigo" />
          <span> Jakarta, ID</span>
          <ChevronDown size={13} className="text-ink-muted" />
        </button>
      </div>

      {/* Center: Home Quick Button & Global Search Pill */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {/* Home Quick Button */}
        <button
          onClick={() => handleNavigate('discover')}
          title="Beranda"
          aria-label="Beranda"
          className={`w-12 h-12 shrink-0 rounded-full grid place-items-center transition-all hover:scale-105 cursor-pointer ${
            activeScreen === 'discover'
              ? 'bg-subtle text-ink'
              : 'bg-panel text-ink-soft hover:text-ink'
          }`}
        >
          <Home size={20} className="fill-current" />
        </button>

        {/* Global Search Bar with Category Trigger */}
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
            onClick={() => handleNavigate('categories')}
            title="Kategori"
            aria-label="Kategori"
            className={`w-11 h-full grid place-items-center rounded-r-full transition-colors cursor-pointer ${
              activeScreen === 'categories'
                ? 'text-indigo'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Right side: Notification Badge & User Profile Popover */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button
          className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-subtle transition-colors cursor-pointer"
          title="Notifikasi"
          aria-label="Notifikasi"
        >
          <Bell size={18} className="text-ink-soft" />
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 grid place-items-center text-[10px] font-bold text-white bg-danger rounded-full ring-2 ring-canvas">
            {user.unreadNotificationsCount ?? 3}
          </span>
        </button>

        {/* User Profile Avatar with Popover Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 pl-0.5 pr-1.5 h-10 rounded-full hover:bg-subtle transition-colors cursor-pointer"
            aria-label="Profil Pengguna"
            title={user.name}
          >
            <span className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              {user.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald ring-2 ring-canvas" />
              )}
            </span>
            <ChevronDown size={14} className="text-ink-muted" />
          </button>

          {/* Popover Dropdown Menu */}
          {isMenuOpen && (
            <div className="pop-in absolute right-0 top-[calc(100%+8px)] w-[280px] bg-canvas border border-line rounded-2xl shadow-pop overflow-hidden z-50">
              {/* User Info Header */}
              <div className="p-4 flex items-center gap-3 border-b border-subtle">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold truncate text-ink">{user.name}</p>
                  <p className="text-[12px] text-ink-muted truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-violet bg-violet/10 rounded-full px-2 py-0.5">
                    {user.membershipTier}
                  </span>
                </div>
              </div>

              {/* 6 Menu Items */}
              <div className="p-1.5">
                <MenuItem
                  icon={Ticket}
                  label="Tiket Saya"
                  badge={`${user.activeTicketsCount ?? 2} Aktif`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigate('tickets');
                  }}
                />
                <MenuItem
                  icon={Receipt}
                  label="Riwayat Pesanan"
                  onClick={() => setIsMenuOpen(false)}
                />
                <MenuItem
                  icon={Heart}
                  label="Event Favorit"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="my-1.5 h-px bg-subtle" />
                <MenuItem
                  icon={Settings}
                  label="Pengaturan Akun"
                  onClick={() => setIsMenuOpen(false)}
                />
                <MenuItem
                  icon={CircleHelp}
                  label="Pusat Bantuan & FAQ"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="my-1.5 h-px bg-subtle" />
                <MenuItem
                  icon={LogOut}
                  label="Keluar (Log Out)"
                  danger
                  onClick={() => setIsMenuOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
