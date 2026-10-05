import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SeatMap } from './components/SeatMap';
import { OrderSummary } from './components/OrderSummary';
import { PaymentModal } from './components/PaymentModal';
import { initialCategories } from './data/mockSeats';
import { SeatCategory, Seat, SelectedSeat } from './types/booking';
import './App.css';

export function App() {
  const [categories, setCategories] = useState<SeatCategory[]>(initialCategories);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  // Initial 243 seconds = 04:03 matching reference image
  const [lockTimerSeconds, setLockTimerSeconds] = useState<number>(243);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

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
    }, 3000);
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

  const handlePaymentSuccess = () => {
    // Mark booked seats as sold
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
    showToast('Pembayaran berhasil! Tiket Anda telah diterbitkan.');
  };

  return (
    <>
      {/* Top Navbar */}
      <Navbar />

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
          onProceedToPayment={() => setIsPaymentOpen(true)}
          lockTimerSeconds={lockTimerSeconds}
        />
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && <div className="toast-notice">{toastMessage}</div>}

      {/* QRIS Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        selectedSeats={selectedSeats}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

export default App;
