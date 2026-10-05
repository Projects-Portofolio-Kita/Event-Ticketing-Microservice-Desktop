import type { FC } from 'react';
import { MapPin, ChevronDown, Search, LayoutGrid, Bell, Ticket, Home, Server } from 'lucide-react';

interface NavbarProps {
  backendOnline?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ backendOnline = false }) => {
  return (
    <header className="tickid-navbar">
      <div className="navbar-left">
        {/* Brand Logo */}
        <div className="brand-logo">
          <div className="brand-icon-box">
            <Ticket className="brand-icon" size={20} />
          </div>
          <span className="brand-name">TickId</span>
        </div>

        {/* Location Dropdown */}
        <button className="location-pill">
          <MapPin size={16} className="location-icon" />
          <span className="location-text">Jakarta, ID</span>
          <ChevronDown size={14} className="location-chevron" />
        </button>

        {/* Home Button */}
        <button className="home-circle-btn" title="Beranda">
          <Home size={18} className="home-icon" />
        </button>

        {/* Backend Status Pill */}
        <div
          className={`backend-pill ${backendOnline ? 'online' : 'offline'}`}
          title={
            backendOnline
              ? 'Terhubung langsung ke Go Microservice (Port 8083: Booking / 8084: Payment)'
              : 'Backend Go offline (otomatis menggunakan mode simulasi lokal)'
          }
        >
          <Server size={13} />
          <span className="backend-status-dot" />
          <span className="backend-text">{backendOnline ? 'API Connected' : 'Demo API'}</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="navbar-center">
        <div className="search-pill">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Konser, artis, festival, atau venue apa?"
          />
          <button className="category-grid-btn" title="Kategori">
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Right User Actions */}
      <div className="navbar-right">
        {/* Notification Bell */}
        <button className="notification-btn" title="Notifikasi">
          <Bell size={20} className="bell-icon" />
          <span className="notification-badge">3</span>
        </button>

        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar-wrapper">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="User Avatar"
              className="user-avatar"
            />
            <span className="online-indicator" />
          </div>
          <ChevronDown size={14} className="user-chevron" />
        </div>
      </div>
    </header>
  );
};
