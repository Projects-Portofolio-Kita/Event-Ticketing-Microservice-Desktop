import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SeatMap } from './components/SeatMap';
import { OrderSummary } from './components/OrderSummary';
import { PaymentModal } from './components/PaymentModal';
import { initialCategories } from './data/mockSeats';
import { SeatCategory, Seat, SelectedSeat } from './types/booking';
import {
  checkBackendHealth,
  createReservation,
  cancelReservation,
  fetchEvents,
  fetchSeatMap,
  seatIdToUUID,
} from './services/api';
import { Session, getSession, logout } from './services/auth';
import { LoginScreen } from './components/LoginScreen';
import './App.css';

// Enrich fallback seats with a deterministic UUID so booking still works offline
function withSeatIds(categories: SeatCategory[]): SeatCategory[] {
  return categories.map((cat) => ({
    ...cat,
    rows: cat.rows.map((row) => ({
      ...row,
      leftSeats: row.leftSeats.map((s) => ({ ...s, seatId: seatIdToUUID(s.id) })),
      rightSeats: row.rightSeats.map((s) => ({ ...s, seatId: seatIdToUUID(s.id) })),
    })),
  }));
}

export function App() {
  const [categories, setCategories] = useState<SeatCategory[]>(() => withSeatIds(initialCategories));
  const [event, setEvent] = useState<{ id: string; name: string; venue: string }>({
    id: 'e9b533e4-6725-4c07-ba91-039c4a8a0b01',
    name: 'Coldplay 2026',
    venue: 'Stadion Utama Gelora Bung Karno',
  });
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  // Initial 243 seconds = 04:03 matching reference image
  const [lockTimerSeconds, setLockTimerSeconds] = useState<number>(243);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
  // Signed-out users only ever reach the login gate below.
  const [session, setSession] = useState<Session | null>(() => getSession());

  // Active reservation session state
  const [currentReservationId, setCurrentReservationId] = useState<string | null>(null);
  const [currentBookingRef, setCurrentBookingRef] = useState<string | null>(null);

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

  // Load event + seat map from catalog-service on mount (fallback: static data)
  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        const events = await fetchEvents();
        if (cancelled || events.length === 0) return;

        const firstEvent = events[0];
        const seatMap = await fetchSeatMap(firstEvent.id);
        if (cancelled || seatMap.length === 0) return;

        setCategories(seatMap);
        setEvent({ id: firstEvent.id, name: firstEvent.name, venue: firstEvent.venue });
      } catch {
        // catalog-service offline: keep static fallback data
      }
    };

    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setLockTimerSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show temporary toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle seat selection
  const handleToggleSeat = (clickedSeat: Seat, categoryName: string, subtitle: string) => {
    const isCurrentlySelected = clickedSeat.status === 'selected';
    const newStatus = isCurrentlySelected ? 'available' : 'selected';

    // Update seat state in categories tree
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        rows: cat.rows.map((row) => ({
          ...row,
          leftSeats: row.leftSeats.map((s) => (s.id === clickedSeat.id ? { ...s, status: newStatus } : s)),
          rightSeats: row.rightSeats.map((s) => (s.id === clickedSeat.id ? { ...s, status: newStatus } : s)),
        })),
      }))
    );

    // Update selected seats list
    if (isCurrentlySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== clickedSeat.id));
    } else {
      const newSelected: SelectedSeat = {
        id: clickedSeat.id,
        seatId: clickedSeat.seatId ?? seatIdToUUID(clickedSeat.id),
        categoryName,
        subtitle,
        seatLabel: `Baris ${clickedSeat.row} · No ${clickedSeat.number < 10 ? '0' + clickedSeat.number : clickedSeat.number}`,
        row: clickedSeat.row,
        number: clickedSeat.number,
        price: clickedSeat.price,
      };
      setSelectedSeats((prev) => [...prev, newSelected]);

      // If timer is 0, reset lock timer to 5 mins (300s)
      if (lockTimerSeconds === 0) {
        setLockTimerSeconds(300);
      }
    }
  };

  // Remove seat directly from summary sidebar
  const handleRemoveSeat = (seatId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        rows: cat.rows.map((row) => ({
          ...row,
          leftSeats: row.leftSeats.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
          rightSeats: row.rightSeats.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
        })),
      }))
    );
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
  };

  // Handle proceed to QRIS payment (triggers backend reservation lock)
  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) return;

    setIsBookingLoading(true);
    try {
      const res = await createReservation(selectedSeats, event.id);
      setCurrentReservationId(res.reservationId);
      setCurrentBookingRef(res.bookingRef);

      // Sync remaining seconds if expiresAt is provided
      if (res.expiresAt) {
        const remainingSecs = Math.max(0, Math.floor((new Date(res.expiresAt).getTime() - Date.now()) / 1000));
        if (remainingSecs > 0) {
          setLockTimerSeconds(remainingSecs);
        }
      }

      if (res.isMock) {
        showToast('Reservasi siap! (Mode demonstrasi aktif)');
      } else {
        showToast(`Kursi berhasil di-lock di database! Ref: ${res.bookingRef}`);
      }

      setIsPaymentOpen(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat reservasi di server.';
      showToast(message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Mark booked seats as sold in local view
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        rows: cat.rows.map((row) => ({
          ...row,
          leftSeats: row.leftSeats.map((s) =>
            selectedSeats.some((sel) => sel.id === s.id) ? { ...s, status: 'sold' } : s
          ),
          rightSeats: row.rightSeats.map((s) =>
            selectedSeats.some((sel) => sel.id === s.id) ? { ...s, status: 'sold' } : s
          ),
        })),
      }))
    );
    setSelectedSeats([]);
    setCurrentReservationId(null);
    setCurrentBookingRef(null);
    showToast('Pembayaran berhasil! Tiket Anda telah tersimpan dan terbit.');
  };

  const handleClosePaymentModal = () => {
    setIsPaymentOpen(false);
    if (currentReservationId && backendOnline) {
      cancelReservation(currentReservationId);
    }
  };

  // Without a session there is nothing to book with: booking- and
  // payment-service only accept calls carrying a verified access token.
  if (!session) {
    return <LoginScreen onLoggedIn={setSession} />;
  }

  return (
    <>
      {/* Top Navbar with backend health status */}
      <Navbar
        backendOnline={backendOnline}
        user={{ name: session.user.name, email: session.user.email }}
        onLogout={() => {
          logout();
          setSession(null);
        }}
      />

      {/* Main Booking Area */}
      <main className="booking-main-container">
        {/* Left Column: Seat Map */}
        <SeatMap
          categories={categories}
          onToggleSeat={handleToggleSeat}
          onSeatAlert={showToast}
          eventName={event.name}
          venue={event.venue}
        />

        {/* Right Column: Order Summary */}
        <OrderSummary
          selectedSeats={selectedSeats}
          onRemoveSeat={handleRemoveSeat}
          onProceedToPayment={handleProceedToPayment}
          lockTimerSeconds={lockTimerSeconds}
          isLoading={isBookingLoading}
        />
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && <div className="toast-notice">{toastMessage}</div>}

      {/* QRIS Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={handleClosePaymentModal}
        selectedSeats={selectedSeats}
        reservationId={currentReservationId}
        bookingRef={currentBookingRef}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

export default App;
