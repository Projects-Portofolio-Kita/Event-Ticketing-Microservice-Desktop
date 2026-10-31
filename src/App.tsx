/**
 * @file App.tsx
 * @description Master desktop app shell with isomorphic HashRouter and MemoryRouter support.
 */
import { HashRouter, MemoryRouter } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';
import { BookingProvider } from './context/BookingContext';
import { ScreenType } from './types/navigation';
import { AppRoutes, AppShell, screenToPath } from './app_routes';
import './App.css';

export { AppRoutes, AppShell };

export interface AppProps {
  initialScreen?: ScreenType;
  initialEventId?: string;
  initialEntries?: string[];
  useMemoryRouter?: boolean;
}

export function App({
  initialScreen,
  initialEventId = 'coldplay-2026',
  initialEntries,
  useMemoryRouter
}: AppProps = {}) {
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
