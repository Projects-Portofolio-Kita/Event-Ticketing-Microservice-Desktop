import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Layers,
  Armchair,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { SeatMap } from '../components/SeatMap';
import { TicketTierSelector } from '../components/TicketTierSelector';
import { OrderSummary } from '../components/OrderSummary';
import { PaymentModal } from '../components/PaymentModal';
import {
  cancelReservation,
  createReservation,
  createTierReservation,
  fetchEvent,
  fetchSeatMap,
  fetchTicketTypes,
  seatIdToUUID,
} from '../services/api';
import { Session } from '../services/auth';
import {
  EventSummary,
  OrderItem,
  Seat,
  SeatCategory,
  SelectedSeat,
  SelectedTicket,
  TicketType,
} from '../types/booking';
import { categoryLabel } from '../data/categories';

interface EventDetailPageProps {
  session: Session | null;
  backendOnline: boolean;
  showToast: (message: string) => void;
  onLoginRequired: () => void;
}

const LOCK_SECONDS = 300;

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Event detail + checkout. SEATED events render the numbered seat map, TIER
 * events render quota-based tier cards — no seat circles on tier events.
 */
export const EventDetailPage: FC<EventDetailPageProps> = ({
  session,
  backendOnline,
  showToast,
  onLoginRequired,
}) => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [lockTimerSeconds, setLockTimerSeconds] = useState<number>(LOCK_SECONDS);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState<string | null>(null);
  const [currentBookingRef, setCurrentBookingRef] = useState<string | null>(null);

  // Load event + its seatmap or ticket tiers.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setIsLoading(true);
    setLoadError(null);
    setEvent(null);
    setCategories([]);
    setTicketTypes([]);
    setSelectedSeats([]);
    setQuantities({});

    (async () => {
      try {
        const details = await fetchEvent(id);
        if (cancelled) return;
        setEvent(details);

        if (details.saleMode === 'TIER') {
          const list = await fetchTicketTypes(id);
          if (cancelled) return;
          setTicketTypes(list.ticketTypes ?? []);
        } else {
          const seatMap = await fetchSeatMap(id);
          if (cancelled) return;
          setCategories(seatMap);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Gagal memuat event.';
        setLoadError(message);
        showToast(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, showToast]);

  // Countdown timer for the lock window.
  useEffect(() => {
    const timer = setInterval(() => {
      setLockTimerSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const restartTimer = useCallback(() => {
    setLockTimerSeconds((prev) => (prev === 0 ? LOCK_SECONDS : prev));
  }, []);

  /* --- SEATED: seat selection ------------------------------------------- */

  const handleToggleSeat = (clickedSeat: Seat, categoryName: string, subtitle: string) => {
    const isCurrentlySelected = clickedSeat.status === 'selected';
    const newStatus = isCurrentlySelected ? 'available' : 'selected';

    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        rows: cat.rows.map((row) => ({
          ...row,
          leftSeats: row.leftSeats.map((s) =>
            s.id === clickedSeat.id ? { ...s, status: newStatus } : s
          ),
          rightSeats: row.rightSeats.map((s) =>
            s.id === clickedSeat.id ? { ...s, status: newStatus } : s
          ),
        })),
      }))
    );

    if (isCurrentlySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== clickedSeat.id));
    } else {
      setSelectedSeats((prev) => [
        ...prev,
        {
          kind: 'seat',
          id: clickedSeat.id,
          seatId: clickedSeat.seatId ?? seatIdToUUID(clickedSeat.id),
          categoryName,
          subtitle,
          seatLabel: `Baris ${clickedSeat.row} · No ${
            clickedSeat.number < 10 ? '0' + clickedSeat.number : clickedSeat.number
          }`,
          row: clickedSeat.row,
          number: clickedSeat.number,
          price: clickedSeat.price,
        },
      ]);
      restartTimer();
    }
  };

  const handleRemoveSeat = (seatId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        rows: cat.rows.map((row) => ({
          ...row,
          leftSeats: row.leftSeats.map((s) =>
            s.id === seatId ? { ...s, status: 'available' } : s
          ),
          rightSeats: row.rightSeats.map((s) =>
            s.id === seatId ? { ...s, status: 'available' } : s
          ),
        })),
      }))
    );
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
  };

  /* --- TIER: quantity selection ------------------------------------------ */

  const handleTierChange = (categoryId: string, quantity: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[categoryId];
      } else {
        next[categoryId] = quantity;
      }
      return next;
    });
    if (quantity > 0) restartTimer();
  };

  const selectedTickets: SelectedTicket[] = useMemo(
    () =>
      ticketTypes
        .filter((ticket) => (quantities[ticket.categoryId] ?? 0) > 0)
        .map((ticket) => ({
          kind: 'tier',
          id: ticket.categoryId,
          categoryId: ticket.categoryId,
          categoryName: ticket.name,
          subtitle: ticket.description ?? '',
          price: ticket.price,
          quantity: quantities[ticket.categoryId],
        })),
    [quantities, ticketTypes]
  );

  const orderItems: OrderItem[] = useMemo(
    () => (event?.saleMode === 'TIER' ? selectedTickets : selectedSeats),
    [event?.saleMode, selectedSeats, selectedTickets]
  );

  const handleRemoveItem = (itemId: string) => {
    if (event?.saleMode === 'TIER') {
      handleTierChange(itemId, 0);
      return;
    }
    handleRemoveSeat(itemId);
  };

  /* --- Checkout ---------------------------------------------------------- */

  const handleProceedToPayment = async () => {
    if (!event) return;
    // Browsing is public, paying is not: gate on the session here so the user
    // comes straight back to this event after signing in.
    if (!session) {
      onLoginRequired();
      return;
    }
    if (orderItems.length === 0) return;

    setIsBookingLoading(true);
    try {
      const reservation =
        event.saleMode === 'TIER'
          ? await createTierReservation(selectedTickets, event.id)
          : await createReservation(selectedSeats, event.id);

      setCurrentReservationId(reservation.reservationId);
      setCurrentBookingRef(reservation.bookingRef);

      if (reservation.expiresAt) {
        const remainingSecs = Math.max(
          0,
          Math.floor((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000)
        );
        if (remainingSecs > 0) setLockTimerSeconds(remainingSecs);
      }

      showToast(`Reservasi dibuat. Ref: ${reservation.bookingRef}`);
      setIsPaymentOpen(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat reservasi di server.';
      showToast(message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (event?.saleMode === 'TIER') {
      // Refresh remaining stock: the tickets we bought are now locked.
      try {
        const list = await fetchTicketTypes(event.id);
        setTicketTypes(list.ticketTypes ?? []);
      } catch {
        // Availability refresh is best-effort.
      }
      setQuantities({});
    } else {
      // Mark booked seats as sold in the local view.
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
    }

    setCurrentReservationId(null);
    setCurrentBookingRef(null);
    showToast('Pembayaran berhasil! Tiket Anda telah tersimpan dan terbit.');
  };

  const handleClosePaymentModal = () => {
    setIsPaymentOpen(false);
    if (currentReservationId && backendOnline) {
      cancelReservation(currentReservationId);
    }
    setCurrentReservationId(null);
    setCurrentBookingRef(null);
  };

  /* --- Render ------------------------------------------------------------ */

  if (isLoading) {
    return (
      <section className="page-scroll state-box">
        <Loader2 size={28} className="animate-spin" />
        <p>Memuat detail event...</p>
      </section>
    );
  }

  if (loadError || !event) {
    return (
      <section className="page-scroll state-box error">
        <AlertTriangle size={30} />
        <p>{loadError ?? 'Event tidak ditemukan.'}</p>
        <Link className="retry-btn" to="/">
          <ArrowLeft size={15} /> Kembali ke beranda
        </Link>
      </section>
    );
  }

  const isTier = event.saleMode === 'TIER';

  return (
    <div className="event-detail-page">
      {/* Event header */}
      <div className="event-detail-hero">
        <div className="hero-poster">
          {event.posterUrl ? (
            <img src={event.posterUrl} alt={event.name} className="hero-poster-img" />
          ) : (
            <div className="hero-poster-fallback">
              <span>{event.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="hero-info">
          <div className="hero-chips">
            <span className="hero-chip category">{categoryLabel(event.category)}</span>
            <span className={`hero-chip mode ${isTier ? 'tier' : 'seated'}`}>
              {isTier ? <Layers size={12} /> : <Armchair size={12} />}
              {isTier ? 'Kuota Tiket' : 'Denah Kursi'}
            </span>
          </div>
          <h1 className="hero-title">{event.name}</h1>
          <div className="hero-meta">
            <span>
              <MapPin size={14} /> {event.venue} · {event.city}
            </span>
            <span>
              <CalendarDays size={14} /> {formatDate(event.eventDate)}
              {formatTime(event.eventDate) && ` · ${formatTime(event.eventDate)} WIB`}
            </span>
          </div>
          {event.description && <p className="hero-description">{event.description}</p>}
        </div>

        <Link className="back-link" to="/" title="Kembali">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      {/* Seat map or tier cards + order summary */}
      <div className="event-detail-layout">
        <div className="event-detail-main">
          {isTier ? (
            <div className="tier-scroll">
              <TicketTierSelector
                ticketTypes={ticketTypes}
                quantities={quantities}
                onChange={handleTierChange}
              />
            </div>
          ) : categories.length > 0 ? (
            <SeatMap
              categories={categories}
              onToggleSeat={handleToggleSeat}
              onSeatAlert={showToast}
              eventName={event.name}
              venue={event.venue}
            />
          ) : (
            <div className="state-box">
              <Armchair size={28} />
              <p>Denah kursi untuk event ini belum tersedia.</p>
            </div>
          )}
        </div>

        <OrderSummary
          items={orderItems}
          onRemove={handleRemoveItem}
          onProceedToPayment={handleProceedToPayment}
          lockTimerSeconds={lockTimerSeconds}
          mode={event.saleMode}
          isLoading={isBookingLoading}
        />
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={handleClosePaymentModal}
        items={orderItems}
        eventName={event.name}
        reservationId={currentReservationId}
        bookingRef={currentBookingRef}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default EventDetailPage;
