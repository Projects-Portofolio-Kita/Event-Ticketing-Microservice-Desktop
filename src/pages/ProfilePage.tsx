import { useCallback, useEffect, useMemo, useState, type FC, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Camera,
  Loader2,
  Plus,
  RefreshCw,
  Bookmark,
  CalendarDays,
  Ticket,
  Save,
} from 'lucide-react';
import { fetchEvents, fetchEvent, fetchReservations } from '../services/api';
import { fetchMe, updateProfile, Session } from '../services/auth';
import { EventSummary, Reservation } from '../types/booking';
import { EventCard } from '../components/EventCard';
import { categoryLabel } from '../data/categories';

interface ProfilePageProps {
  session: Session;
  onSessionChange: (session: Session) => void;
  showToast: (message: string) => void;
}

type Tab = 'profile' | 'tickets' | 'events';

const TAB_LABELS: { value: Tab; label: string; icon: typeof Bookmark }[] = [
  { value: 'profile', label: 'Profil', icon: Camera },
  { value: 'tickets', label: 'Tiket Saya', icon: Bookmark },
  { value: 'events', label: 'Event Saya', icon: CalendarDays },
];

const STATUS_LABEL: Record<Reservation['status'], string> = {
  LOCKED: 'Menunggu Pembayaran',
  CONFIRMED: 'Terbayar',
  EXPIRED: 'Kedaluwarsa',
  CANCELLED: 'Dibatalkan',
};

const formatRupiah = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const initials = (value: string) => (value || '?').charAt(0).toUpperCase();

/**
 * Account hub: edit name/avatar, review purchased tickets ("Tiket Saya") and
 * manage published events ("Event Saya").
 */
export const ProfilePage: FC<ProfilePageProps> = ({ session, onSessionChange, showToast }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: Tab =
    tabParam === 'tickets' || tabParam === 'events' ? tabParam : 'profile';

  /* --- Profile form ------------------------------------------------------ */
  const [name, setName] = useState(session.user.name ?? '');
  const [avatar, setAvatar] = useState(session.user.avatar ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Re-sync the profile from the server (Google avatars, other devices...).
  useEffect(() => {
    fetchMe()
      .then((user) => {
        setName(user.name ?? '');
        setAvatar(user.avatar ?? '');
      })
      .catch(() => {
        // Offline or token expired: the stored profile still renders.
      });
  }, []);

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setProfileError(null);
    setIsSaving(true);
    try {
      const user = await updateProfile(name, avatar);
      onSessionChange({ ...session, user });
      setName(user.name ?? '');
      setAvatar(user.avatar ?? '');
      showToast('Profil berhasil diperbarui.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui profil.';
      setProfileError(message);
      showToast(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseInitials = async () => {
    setAvatar('');
    setProfileError(null);
    setIsSaving(true);
    try {
      const user = await updateProfile(name || session.user.name || 'Akun', '');
      onSessionChange({ ...session, user });
      setAvatar('');
      showToast('Avatar dihapus — memakai inisial.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui profil.';
      setProfileError(message);
    } finally {
      setIsSaving(false);
    }
  };

  /* --- Tiket Saya -------------------------------------------------------- */
  const [tickets, setTickets] = useState<Reservation[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [eventNames, setEventNames] = useState<Record<string, EventSummary>>({});

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const list = await fetchReservations();
      setTickets(list);

      // Resolve event names for the list (best-effort, once per event).
      const ids = Array.from(new Set(list.map((r) => r.eventId)));
      const missing = ids.filter((id) => !eventNames[id]);
      if (missing.length > 0) {
        const fetched = await Promise.all(
          missing.map((id) => fetchEvent(id).catch(() => null))
        );
        setEventNames((prev) => {
          const next = { ...prev };
          fetched.forEach((event, index) => {
            if (event) next[missing[index]] = event;
          });
          return next;
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat tiket.';
      setTicketsError(message);
    } finally {
      setTicketsLoading(false);
    }
  }, [eventNames]);

  useEffect(() => {
    if (activeTab === 'tickets') void loadTickets();
  }, [activeTab, loadTickets]);

  /* --- Event Saya -------------------------------------------------------- */
  const [myEvents, setMyEvents] = useState<EventSummary[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const loadMyEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const result = await fetchEvents({ createdBy: session.user.id });
      setMyEvents(result.events);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat event.';
      setEventsError(message);
    } finally {
      setEventsLoading(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    if (activeTab === 'events') void loadMyEvents();
  }, [activeTab, loadMyEvents]);

  const switchTab = (tab: Tab) => {
    setSearchParams(tab === 'profile' ? {} : { tab });
  };

  const reservationSummary = useMemo(() => {
    return tickets.map((ticket) => {
      const count =
        ticket.mode === 'TIER'
          ? ticket.items.reduce((sum, item) => sum + item.quantity, 0)
          : ticket.seats.length;
      const lines =
        ticket.mode === 'TIER'
          ? ticket.items.map((item) => `${item.categoryName} × ${item.quantity}`)
          : ticket.seats.map((seat) => `${seat.section} · Baris ${seat.row} No ${seat.number}`);
      return { reservation: ticket, count, lines };
    });
  }, [tickets]);

  return (
    <section className="page-scroll profile-page">
      {/* Account header */}
      <div className="profile-hero">
        <div className="profile-avatar-lg">
          {session.user.avatar || avatar ? (
            <img
              src={(avatar || session.user.avatar) as string}
              alt="Avatar"
              className="profile-avatar-img"
            />
          ) : (
            <span>{initials(name || session.user.name || session.user.email)}</span>
          )}
        </div>
        <div className="profile-identity">
          <h1 className="page-title">{name || session.user.name || 'Akun TickId'}</h1>
          <p className="page-subtitle">{session.user.email}</p>
        </div>
        <Link className="primary-btn compact" to="/create">
          <Plus size={15} /> Buat Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TAB_LABELS.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              key={entry.value}
              className={`profile-tab ${activeTab === entry.value ? 'active' : ''}`}
              onClick={() => switchTab(entry.value)}
            >
              <Icon size={15} />
              {entry.label}
            </button>
          );
        })}
      </div>

      {/* --- Profile form -------------------------------------------------- */}
      {activeTab === 'profile' && (
        <form className="form-card profile-form" onSubmit={handleSaveProfile}>
          <legend className="form-card-title">Ubah Profil</legend>

          <div className="profile-form-row">
            <div className="profile-avatar-editor">
              <div className="profile-avatar-lg small">
                {avatar ? (
                  <img src={avatar} alt="Preview avatar" className="profile-avatar-img" />
                ) : (
                  <span>{initials(name || session.user.email)}</span>
                )}
              </div>
              <button
                type="button"
                className="ghost-btn compact"
                onClick={handleUseInitials}
                disabled={isSaving || !avatar}
              >
                Pakai inisial
              </button>
            </div>

            <div className="profile-fields">
              <label className="form-field">
                <span>Nama lengkap</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={1}
                  maxLength={100}
                  required
                />
              </label>

              <label className="form-field">
                <span>URL avatar</span>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  maxLength={512}
                />
                <small>Belum ada upload file — tempel URL gambar atau pakai inisial.</small>
              </label>

              <label className="form-field">
                <span>Email</span>
                <input type="email" value={session.user.email} readOnly disabled />
              </label>
            </div>
          </div>

          {profileError && <div className="form-error-banner">{profileError}</div>}

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} /> Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* --- Tiket Saya ---------------------------------------------------- */}
      {activeTab === 'tickets' && (
        <div className="profile-section">
          <div className="section-head">
            <h2>Tiket Saya</h2>
            <button className="ghost-btn compact" onClick={() => void loadTickets()} disabled={ticketsLoading}>
              <RefreshCw size={14} /> Muat ulang
            </button>
          </div>

          {ticketsLoading ? (
            <div className="state-box">
              <Loader2 size={26} className="animate-spin" />
              <p>Memuat reservasi...</p>
            </div>
          ) : ticketsError ? (
            <div className="state-box error">
              <Ticket size={28} />
              <p>{ticketsError}</p>
              <button className="retry-btn" onClick={() => void loadTickets()}>
                Coba lagi
              </button>
            </div>
          ) : reservationSummary.length === 0 ? (
            <div className="state-box">
              <Bookmark size={28} />
              <p>Belum ada tiket. Saatnya jelajahi event!</p>
              <Link className="retry-btn" to="/">
                Jelajahi event
              </Link>
            </div>
          ) : (
            <div className="ticket-list">
              {reservationSummary.map(({ reservation, count, lines }) => {
                const event = eventNames[reservation.eventId];
                return (
                  <div key={reservation.reservationId} className="ticket-card">
                    <div className="ticket-card-head">
                      <div>
                        <span className="ticket-ref">{reservation.bookingRef}</span>
                        <span className="ticket-event-name">
                          {event ? (
                            <Link to={`/event/${reservation.eventId}`}>{event.name}</Link>
                          ) : (
                            'Memuat event...'
                          )}
                        </span>
                      </div>
                      <span className={`ticket-status status-${reservation.status.toLowerCase()}`}>
                        {STATUS_LABEL[reservation.status]}
                      </span>
                    </div>

                    <div className="ticket-card-meta">
                      <span>{reservation.mode === 'TIER' ? 'Kuota Tiket' : 'Kursi'}</span>
                      <span>{count} tiket</span>
                      <span>{formatDate(reservation.createdAt)}</span>
                      <span className="ticket-total">{formatRupiah(reservation.totalAmount)}</span>
                    </div>

                    <ul className="ticket-lines">
                      {lines.map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Event Saya ---------------------------------------------------- */}
      {activeTab === 'events' && (
        <div className="profile-section">
          <div className="section-head">
            <h2>Event Saya</h2>
            <Link className="primary-btn compact" to="/create">
              <Plus size={15} /> Buat Event Baru
            </Link>
          </div>

          {eventsLoading ? (
            <div className="state-box">
              <Loader2 size={26} className="animate-spin" />
              <p>Memuat event Anda...</p>
            </div>
          ) : eventsError ? (
            <div className="state-box error">
              <CalendarDays size={28} />
              <p>{eventsError}</p>
              <button className="retry-btn" onClick={() => void loadMyEvents()}>
                Coba lagi
              </button>
            </div>
          ) : myEvents.length === 0 ? (
            <div className="state-box">
              <CalendarDays size={28} />
              <p>Anda belum menerbitkan event. Buat yang pertama!</p>
              <Link className="retry-btn" to="/create">
                <Plus size={15} /> Buat event
              </Link>
            </div>
          ) : (
            <div className="event-grid">
              {myEvents.map((event) => (
                <div key={event.id} className="my-event-cell">
                  <EventCard event={event} />
                  <div className="my-event-meta">
                    <span>{categoryLabel(event.category)}</span>
                    <span>{event.ticketTypeCount} tipe tiket</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
