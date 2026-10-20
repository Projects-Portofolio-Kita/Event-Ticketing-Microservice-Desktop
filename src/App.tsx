/**
 * App Component - Master Desktop Application Shell for TickId
 * Router-Driven Multi-Page Architecture (react-router-dom)
 * Clean Architecture & Standalone Client State
 * 
 * Features:
 *  - HashRouter for Tauri desktop runtime compatibility (zero reload 404s)
 *  - Isomorphic MemoryRouter fallback for Node.js SSR & test compatibility
 *  - Root BookingProvider to maintain seat selections, lock timers, and ticket state across routes
 *  - Route hierarchy with persistent Layout (Header + Outlet + CheckoutModal)
 *  - Dedicated page controllers under src/pages/*
 *  - Completely decoupled from backend API services
 */

import {
  HashRouter,
  MemoryRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  DiscoverPage,
  CategoriesPage,
  EventDetailPage,
  SeatMapPage,
  ETicketPage
} from './pages';
import { NavigationProvider } from './context/NavigationContext';
import { BookingProvider } from './context/BookingContext';
import { ScreenType } from './types/navigation';
import './App.css';

export interface AppProps {
  initialScreen?: ScreenType;
  initialEventId?: string;
  initialEntries?: string[];
  useMemoryRouter?: boolean;
}

function screenToPath(screen?: ScreenType, eventId = 'coldplay-2026'): string {
  switch (screen) {
    case 'categories':
      return '/categories';
    case 'detail':
      return `/event/${eventId}`;
    case 'seatmap':
      return `/seatmap/${eventId}`;
    case 'tickets':
      return '/tickets';
    case 'discover':
    default:
      return '/';
  }
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DiscoverPage />} />
        <Route path="discover" element={<Navigate to="/" replace />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="event/:eventId" element={<EventDetailPage />} />
        <Route path="seatmap/:eventId" element={<SeatMapPage />} />
        <Route path="tickets" element={<ETicketPage />} />
        <Route path="tickets/:bookingRef" element={<ETicketPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function AppShell() {
  return <AppRoutes />;
}

export function App({
  initialScreen,
  initialEventId = 'coldplay-2026',
  initialEntries,
  useMemoryRouter
}: AppProps = {}) {
  // Determine router environment: Use MemoryRouter for Node SSR / explicit test props
  const isServer = typeof window === 'undefined';
  const shouldRunMemory = isServer || useMemoryRouter || Boolean(initialScreen) || Boolean(initialEntries);

  const entries = initialEntries || [screenToPath(initialScreen, initialEventId)];

  const content = (
    <NavigationProvider initialScreen={initialScreen || 'discover'} initialEventId={initialEventId}>
      <BookingProvider>
        <AppRoutes />
      </BookingProvider>
    </NavigationProvider>
  );

  if (shouldRunMemory) {
    return <MemoryRouter initialEntries={entries}>{content}</MemoryRouter>;
  }

  return <HashRouter>{content}</HashRouter>;
}

export default App;
