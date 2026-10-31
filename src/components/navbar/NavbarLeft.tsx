/**
 * @file NavbarLeft.tsx
 * @description Navbar left section containing brand logo, location, and backend indicator.
 */
import type { FC } from 'react';
import { MapPin, ChevronDown, Ticket, Home, Server } from 'lucide-react';

export const NavbarLeft: FC<{ backendOnline?: boolean }> = ({ backendOnline = false }) => (
  <div className="navbar-left">
    <div className="brand-logo">
      <div className="brand-icon-box"><Ticket className="brand-icon" size={20} /></div>
      <span className="brand-name">TickId</span>
    </div>
    <button className="location-pill">
      <MapPin size={16} className="location-icon" />
      <span className="location-text">Jakarta, ID</span>
      <ChevronDown size={14} className="location-chevron" />
    </button>
    <button className="home-circle-btn" title="Beranda">
      <Home size={18} className="home-icon" />
    </button>
    <div
      className={`backend-pill ${backendOnline ? 'online' : 'offline'}`}
      title={backendOnline ? 'Terhubung langsung ke Go Microservice' : 'Backend Go offline (mode simulasi)'}
    >
      <Server size={13} />
      <span className="backend-status-dot" />
      <span className="backend-text">{backendOnline ? 'API Connected' : 'Demo API'}</span>
    </div>
  </div>
);
