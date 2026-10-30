import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CalendarDays, Armchair, Layers } from 'lucide-react';
import { EventSummary } from '../types/booking';
import { categoryLabel } from '../data/categories';

interface EventCardProps {
  event: EventSummary;
}

const formatRupiah = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const EventCard: FC<EventCardProps> = ({ event }) => {
  const isTier = event.saleMode === 'TIER';

  return (
    <Link className="event-card" to={`/event/${event.id}`}>
      <div className="event-card-poster">
        {event.posterUrl ? (
          <img src={event.posterUrl} alt={event.name} className="event-poster-img" />
        ) : (
          <div className="event-poster-fallback">
            <span>{event.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <span className={`sale-mode-badge ${isTier ? 'tier' : 'seated'}`}>
          {isTier ? <Layers size={12} /> : <Armchair size={12} />}
          {isTier ? 'Tiket' : 'Pilih Kursi'}
        </span>
        <span className="event-category-chip">{categoryLabel(event.category)}</span>
      </div>

      <div className="event-card-body">
        <div className="event-card-meta">
          <span className="meta-date">
            <CalendarDays size={13} />
            {formatDate(event.eventDate)}
          </span>
          <span className="meta-city">
            <MapPin size={13} />
            {event.city}
          </span>
        </div>

        <h3 className="event-card-title">{event.name}</h3>
        <p className="event-card-venue">{event.venue}</p>

        <div className="event-card-footer">
          <div className="event-price-block">
            <span className="price-from">Mulai dari</span>
            <span className="price-value">{formatRupiah(event.minPrice)}</span>
          </div>
          <span className="ticket-type-count">
            {event.ticketTypeCount} tipe tiket
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
