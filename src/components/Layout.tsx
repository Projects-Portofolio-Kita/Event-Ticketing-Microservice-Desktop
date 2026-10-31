/**
 * @file Layout.tsx
 * @description Persistent master shell wrapping Header, main outlet, and global CheckoutModal.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { CheckoutModal } from './CheckoutModal';
import { useBooking } from '../context/BookingContext';

export const Layout: React.FC = () => {
  const { isCheckoutOpen } = useBooking();

  return (
    <div className="app-container min-h-screen bg-panel text-ink flex flex-col font-sans">
      <Header />
      <main className="main-content-region flex-1 w-full overflow-y-auto bg-panel" role="main">
        <Outlet />
      </main>
      {isCheckoutOpen && <CheckoutModal />}
    </div>
  );
};

export default Layout;
