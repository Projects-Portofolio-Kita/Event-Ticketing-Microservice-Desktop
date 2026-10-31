/**
 * @file event_card_types.ts
 * @description Types and props for EventCard and EventCardImage.
 */
import { EventItem } from '../../types/event';

export interface EventCardProps {
  event: EventItem;
  onClick?: (eventId: string) => void;
  className?: string;
}

export interface EventCardImageProps {
  image: string;
  title: string;
  status?: string;
}
