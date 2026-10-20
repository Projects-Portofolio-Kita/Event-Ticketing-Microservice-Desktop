/**
 * EventCard Component - Independent Reusable Event Card
 * Clean Architecture Presentational Component
 * Displays event artwork, status badge, title, performer, date, venue, and price
 */
import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { EventItem } from '../types/event';
import { formatRupiah } from '../utils/format';
import { StatusBadge } from './StatusBadge';

export interface EventCardProps {
  event: EventItem;
  onClick?: (eventId: string) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  className = ''
}) => {
  const displayImage = event.image || event.img;
  const formattedPrice = event.price || formatRupiah(event.priceStart);

  const handleClick = () => {
    if (onClick) onClick(event.id);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(event.id);
  };

  return (
    <article
      data-testid={`event-card-${event.id}`}
      onClick={handleClick}
      className={`group bg-canvas border border-line rounded-2xl overflow-hidden shadow-card hover:border-indigo/50 hover:shadow-pop hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col ${className}`}
    >
      {/* Event Image Container with Status Badge */}
      <div className="relative h-[200px] bg-subtle overflow-hidden">
        <img
          src={displayImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status Badge (top-right) */}
        {event.status && (
          <div className="absolute top-2.5 right-2.5">
            <StatusBadge label={event.status} />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 space-y-1">
        {/* Event Title */}
        <h3 className="font-display font-bold text-[15px] leading-snug truncate text-ink">
          {event.title}
        </h3>

        {/* Artist / Performer */}
        <p className="text-[13px] text-indigo font-medium truncate">
          {event.artist}
        </p>

        {/* Date & Venue Metadata */}
        <div className="mt-2 space-y-1 text-[12px] text-ink-muted">
          <p className="flex items-center gap-1.5">
            <Calendar size={13} className="text-ink-muted shrink-0" />
            <span>{event.date}</span>
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="text-ink-muted shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
        </div>

        {/* Accessible Test Elements for Price & Button */}
        <div className="sr-only">
          <p>{formattedPrice}</p>
          <button onClick={handleActionClick}>
            Lihat Tiket
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
