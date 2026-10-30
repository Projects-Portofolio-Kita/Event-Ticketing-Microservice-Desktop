import { useCallback, useEffect, useRef, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { DiscoverPage } from './pages/DiscoverPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { ProfilePage } from './pages/ProfilePage';
import { checkBackendHealth, fetchCities } from './services/api';
import { CityEntry, DiscoveryFilters } from './types/booking';
import { Session, getSession, logout, onSessionChange } from './services/auth';
import './App.css';

const EMPTY_FILTERS: DiscoveryFilters = { q: '', city: '', category: '' };

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState<Session | null>(() => getSession());
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS);
  const [cities, setCities] = useState<CityEntry[]>([]);

  // The auth module owns the real session (it refreshes the access token and
  // may drop it when the refresh token dies). Follow it so the navbar and the
  // route guards never show a signed-in user whose token no longer works.
  const manualLogoutRef = useRef(false);
  useEffect(() => {
    let previous = getSession();
    return onSessionChange((next) => {
      const wasSignedIn = Boolean(previous);
      previous = next;
      setSession(next);

      if (!next && wasSignedIn && !manualLogoutRef.current) {
        setToastMessage('Sesi Anda kedaluwarsa. Silakan masuk ulang.');
        setTimeout(() => setToastMessage(null), 3500);
        navigate('/login');
      }
      manualLogoutRef.current = false;
    });
  }, [navigate]);

  // Check backend microservices health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const status = await checkBackendHealth();
      setBackendOnline(status.bookingService);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // City list for the location picker (also warms the discovery cache).
  useEffect(() => {
    let cancelled = false;
    fetchCities().then((list) => {
      if (!cancelled) setCities(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Changing a filter always brings the user back to the discovery grid.
  const applyFilters = useCallback(
    (patch: Partial<DiscoveryFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
      if (location.pathname !== '/') navigate('/');
    },
    [location.pathname, navigate]
  );

  const handleLogout = useCallback(() => {
    manualLogoutRef.current = true;
    logout();
    setSession(null);
    setFilters(EMPTY_FILTERS);
    navigate('/');
  }, [navigate]);

  const handleLoggedIn = useCallback(
    (next: Session) => {
      setSession(next);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/', { replace: true });
    },
    [location.state, navigate]
  );

  // The sign-in gate is a full-screen view of its own.
  const isLoginRoute = location.pathname === '/login';

  return (
    <>
      {!isLoginRoute && (
        <Navbar
          backendOnline={backendOnline}
          session={session}
          filters={filters}
          cities={cities}
          onFiltersChange={applyFilters}
          onLogout={handleLogout}
        />
      )}

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <DiscoverPage
                filters={filters}
                onFiltersChange={applyFilters}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/event/:id"
            element={
              <EventDetailPage
                session={session}
                backendOnline={backendOnline}
                showToast={showToast}
                onLoginRequired={() => navigate('/login', { state: { from: location.pathname } })}
              />
            }
          />
          <Route
            path="/create"
            element={
              session ? (
                <CreateEventPage showToast={showToast} />
              ) : (
                <Navigate to="/login" replace state={{ from: '/create' }} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              session ? (
                <ProfilePage
                  session={session}
                  onSessionChange={setSession}
                  showToast={showToast}
                />
              ) : (
                <Navigate to="/login" replace state={{ from: '/profile' }} />
              )
            }
          />
          <Route
            path="/login"
            element={session ? <Navigate to="/" replace /> : <LoginScreen onLoggedIn={handleLoggedIn} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {toastMessage && <div className="toast-notice">{toastMessage}</div>}
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}

export default App;
