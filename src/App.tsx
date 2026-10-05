import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SeatMap } from './components/SeatMap';
import { OrderSummary } from './components/OrderSummary';
import { PaymentModal } from './components/PaymentModal';
import { initialCategories } from './data/mockSeats';
import { SeatCategory, Seat, SelectedSeat } from './types/booking';
import { checkBackendHealth, createReservation, cancelReservation } from './services/api';
import './App.css';

export function App() {
  const [categories, setCategories] = useState<SeatCategory[]>(initialCategories);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  // Initial 243 seconds = 04:03 matching reference image
  const [lockTimerSeconds, setLockTimerSeconds] = useState<number>(243);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);

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
        categoryName,
        subtitle,
        seatLabel: `Baris ${clickedSeat.row} · No ${clickedSeat.number < 10 ? '0' + clickedSeat.number : clickedSeat.number}`,
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
      const res = await createReservation(selectedSeats);
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

  return (
    <>
      {/* Top Navbar with backend health status */}
      <Navbar backendOnline={backendOnline} />

      {/* Main Booking Area */}
      <main className="booking-main-container">
        {/* Left Column: Seat Map */}
        <SeatMap
          categories={categories}
          onToggleSeat={handleToggleSeat}
          onSeatAlert={showToast}
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
