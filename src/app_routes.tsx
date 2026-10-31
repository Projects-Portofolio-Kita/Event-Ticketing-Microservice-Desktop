/**
 * @file app_routes.tsx
 * @description Route table definitions and screen-to-path resolver for desktop application.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DiscoverPage, CategoriesPage, EventDetailPage, SeatMapPage, ETicketPage } from './pages';
import { ScreenType } from './types/navigation';

export function screenToPath(screen?: ScreenType, eventId = 'coldplay-2026'): string {
  switch (screen) {
    case 'categories': return '/categories';
    case 'detail': return `/event/${eventId}`;
    case 'seatmap': return `/seatmap/${eventId}`;
    case 'tickets': return '/tickets';
    case 'discover': default: return '/';
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
