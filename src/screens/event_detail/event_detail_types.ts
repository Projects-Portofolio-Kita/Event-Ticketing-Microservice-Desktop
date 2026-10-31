/**
 * @file event_detail_types.ts
 * @description Type definitions for EventDetailScreen props.
 */
import { ConcertMeta, TicketTierItem, FaqItem } from '../../types/event';
import { ScreenType } from '../../types/navigation';

export interface EventDetailScreenProps {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  concert?: ConcertMeta;
  ticketTiers?: TicketTierItem[];
  faqItems?: FaqItem[];
  eventId?: string;
}

export interface EventDetailHeroProps {
  concert: ConcertMeta;
  onNavigate: (s: ScreenType) => void;
}
