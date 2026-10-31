/**
 * @file NavbarRight.tsx
 * @description Navbar right actions with notification bell and user profile avatar.
 */
import type { FC } from 'react';
import { Bell, ChevronDown } from 'lucide-react';

export const NavbarRight: FC = () => (
  <div className="navbar-right">
    <button className="notification-btn" title="Notifikasi">
      <Bell size={20} className="bell-icon" />
      <span className="notification-badge">3</span>
    </button>
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
);
