import { useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
  Search,
  LayoutGrid,
  Bell,
  Ticket,
  Home,
  Server,
  LogOut,
  Plus,
  UserRound,
  CalendarDays,
  Bookmark,
} from 'lucide-react';
import { CityEntry, DiscoveryFilters } from '../types/booking';
import { Session } from '../services/auth';
import { EVENT_CATEGORIES } from '../data/categories';

interface NavbarProps {
  backendOnline?: boolean;
  session: Session | null;
  filters: DiscoveryFilters;
  cities: CityEntry[];
  onFiltersChange: (patch: Partial<DiscoveryFilters>) => void;
  onLogout: () => void;
}

type OpenMenu = 'location' | 'category' | 'user' | null;

export const Navbar: FC<NavbarProps> = ({
  backendOnline = false,
  session,
  filters,
  cities,
  onFiltersChange,
  onLogout,
}) => {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [searchDraft, setSearchDraft] = useState(filters.q);

  // Keep the draft in sync when the filter changes elsewhere (logout, card...).
  useEffect(() => {
    setSearchDraft(filters.q);
  }, [filters.q]);

  // One click anywhere outside the navbar closes every open dropdown.
  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggle = (menu: Exclude<OpenMenu, null>) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const goHome = () => {
    setOpenMenu(null);
    navigate('/');
  };

  const pickCity = (city: string) => {
    onFiltersChange({ city });
    setOpenMenu(null);
  };

  const pickCategory = (category: string) => {
    onFiltersChange({ category });
    setOpenMenu(null);
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    onFiltersChange({ q: searchDraft.trim() });
  };

  const locationLabel = filters.city ? `${filters.city}, ID` : 'Semua Lokasi';

  return (
    <header className="tickid-navbar" ref={navRef}>
      <div className="navbar-left">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={goHome}>
          <div className="brand-icon-box">
            <Ticket className="brand-icon" size={20} />
          </div>
          <span className="brand-name">TickId</span>
        </div>

        {/* Location Dropdown (data-driven city list) */}
        <div className="dropdown-anchor">
          <button
            className={`location-pill ${filters.city ? 'active' : ''}`}
            onClick={() => toggle('location')}
            aria-expanded={openMenu === 'location'}
          >
            <MapPin size={16} className="location-icon" />
            <span className="location-text">{locationLabel}</span>
            <ChevronDown size={14} className="location-chevron" />
          </button>

          {openMenu === 'location' && (
            <div className="dropdown-menu location-menu">
              <button
                className={`dropdown-item ${filters.city === '' ? 'selected' : ''}`}
                onClick={() => pickCity('')}
              >
                <span>Semua Lokasi</span>
                <span className="dropdown-count">Semua kota</span>
              </button>
              {cities.map((entry) => (
                <button
                  key={entry.city}
                  className={`dropdown-item ${filters.city === entry.city ? 'selected' : ''}`}
                  onClick={() => pickCity(entry.city)}
                >
                  <span>{entry.city}</span>
                  <span className="dropdown-count">{entry.count} event</span>
                </button>
              ))}
              {cities.length === 0 && <div className="dropdown-empty">Memuat kota...</div>}
            </div>
          )}
        </div>

        {/* Home Button */}
        <button className="home-circle-btn" title="Beranda" onClick={goHome}>
          <Home size={18} className="home-icon" />
        </button>

        {/* Backend Status Pill */}
        <div
          className={`backend-pill ${backendOnline ? 'online' : 'offline'}`}
          title={
            backendOnline
              ? 'Terhubung langsung ke Go Microservice (Port 8083: Booking / 8084: Payment)'
              : 'Backend Go offline (beberapa fitur mungkin tidak tersedia)'
          }
        >
          <Server size={13} />
          <span className="backend-status-dot" />
          <span className="backend-text">{backendOnline ? 'API Connected' : 'Demo API'}</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="navbar-center">
        <form className="search-pill" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Konser, artis, festival, atau venue apa?"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
          {searchDraft && (
            <button
              type="button"
              className="search-clear-btn"
              title="Bersihkan pencarian"
              onClick={() => {
                setSearchDraft('');
                onFiltersChange({ q: '' });
              }}
            >
              ×
            </button>
          )}
          <button
            type="button"
            className={`category-grid-btn ${filters.category ? 'active' : ''}`}
            title="Kategori"
            onClick={() => toggle('category')}
          >
            <LayoutGrid size={18} />
          </button>

          {openMenu === 'category' && (
            <div className="dropdown-menu category-menu">
              <button
                className={`dropdown-item ${filters.category === '' ? 'selected' : ''}`}
                onClick={() => pickCategory('')}
              >
                Semua Kategori
              </button>
              {EVENT_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  className={`dropdown-item ${filters.category === category.value ? 'selected' : ''}`}
                  onClick={() => pickCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Right User Actions */}
      <div className="navbar-right">
        {/* Anyone signed in can publish an event */}
        {session && (
          <button
            className="create-event-btn"
            title="Buat event baru"
            onClick={() => navigate('/create')}
          >
            <Plus size={16} />
            <span>Buat Event</span>
          </button>
        )}

        {/* Notification Bell */}
        <button className="notification-btn" title="Notifikasi">
          <Bell size={20} className="bell-icon" />
          <span className="notification-badge">3</span>
        </button>

        {/* Signed-in user: identity, profile menu, way out */}
        {session ? (
          <div className="dropdown-anchor">
            <button className="user-profile" title={session.user.email} onClick={() => toggle('user')}>
              <div className="avatar-wrapper">
                {session.user.avatar ? (
                  <img src={session.user.avatar} alt="Avatar" className="user-avatar" />
                ) : (
                  <span className="user-avatar user-avatar-initials">
                    {(session.user.name || session.user.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="online-indicator" />
              </div>
              <span className="user-name">{session.user.name || session.user.email || 'Akun'}</span>
              <ChevronDown size={14} className="user-chevron" />
            </button>

            {openMenu === 'user' && (
              <div className="dropdown-menu user-menu">
                <div className="dropdown-header">
                  <strong>{session.user.name || 'Akun'}</strong>
                  <span>{session.user.email}</span>
                </div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setOpenMenu(null);
                    navigate('/profile');
                  }}
                >
                  <UserRound size={15} /> Profil Saya
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setOpenMenu(null);
                    navigate('/profile?tab=tickets');
                  }}
                >
                  <Bookmark size={15} /> Tiket Saya
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setOpenMenu(null);
                    navigate('/profile?tab=events');
                  }}
                >
                  <CalendarDays size={15} /> Event Saya
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item danger"
                  onClick={() => {
                    setOpenMenu(null);
                    onLogout();
                  }}
                >
                  <LogOut size={15} /> Keluar
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-pill-btn" onClick={() => navigate('/login')}>
            Masuk
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
