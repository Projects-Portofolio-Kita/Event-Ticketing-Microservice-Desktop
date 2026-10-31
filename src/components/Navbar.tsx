/**
 * @file Navbar.tsx
 * @description Top navigation bar assembling left branding, center search, and right actions.
 */
import type { FC } from 'react';
import { Search, LayoutGrid } from 'lucide-react';
import { NavbarLeft, NavbarRight } from './navbar/index';

interface NavbarProps {
  backendOnline?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ backendOnline = false }) => {
  return (
    <header className="tickid-navbar">
      <NavbarLeft backendOnline={backendOnline} />
      <div className="navbar-center">
        <div className="search-pill">
          <Search size={18} className="search-icon" />
          <input type="text" className="search-input" placeholder="Konser, artis, festival, atau venue apa?" />
          <button className="category-grid-btn" title="Kategori"><LayoutGrid size={18} /></button>
        </div>
      </div>
      <NavbarRight />
    </header>
  );
};

export default Navbar;
