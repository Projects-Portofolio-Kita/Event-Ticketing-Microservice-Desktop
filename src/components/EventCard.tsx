/**
 * @file EventCard.tsx
 * @description Event card presentational component with metadata and click actions.
 */
import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import { EventCardProps, EventCardImage } from './event_card/index';

export type { EventCardProps };

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, className = '' }) => {
  const displayImage = event.image || event.img || '';
  const formattedPrice = event.price || formatRupiah(event.priceStart);

  return (
    <article
      data-testid={`event-card-${event.id}`}
      onClick={() => onClick && onClick(event.id)}
      className={`group bg-canvas border border-line rounded-2xl overflow-hidden shadow-card hover:border-indigo/50 hover:shadow-pop hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col ${className}`}
    >
      <EventCardImage image={displayImage} title={event.title} status={event.status} />
      <div className="p-4 flex flex-col flex-1 space-y-1">
        <h3 className="font-display font-bold text-[15px] leading-snug truncate text-ink">{event.title}</h3>
        <p className="text-[13px] text-indigo font-medium truncate">{event.artist}</p>
        <div className="mt-2 space-y-1 text-[12px] text-ink-muted">
          <p className="flex items-center gap-1.5"><Calendar size={13} className="text-ink-muted shrink-0" /><span>{event.date}</span></p>
          <p className="flex items-center gap-1.5 truncate"><MapPin size={13} className="text-ink-muted shrink-0" /><span className="truncate">{event.venue}</span></p>
        </div>
        <div className="sr-only">
          <p>{formattedPrice}</p>
          <button onClick={(e) => { e.stopPropagation(); onClick && onClick(event.id); }}>Lihat Tiket</button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
