/**
 * @file EventDetailScreen.tsx
 * @description Master event detail screen coordinating hero meta, tiers, FAQ, and sticky booking bar.
 */
import React, { useState, useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { mockConcertDetail, mockTicketTiers, mockFaqItems } from '../data/mockEvents';
import { ScreenType } from '../types/navigation';
import {
  EventDetailScreenProps,
  renderEventDetailHero,
  renderEventDetailTiers,
  renderEventDetailFaq,
  renderEventDetailStickyBar,
} from './event_detail/index';

export type { EventDetailScreenProps };

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  onNavigate, concert = mockConcertDetail, ticketTiers = mockTicketTiers, faqItems = mockFaqItems, eventId
}) => {
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try { navContext = useNavigation(); } catch { navContext = null; }

  const handleNavigate = useCallback((s: ScreenType, targetId?: string) => {
    if (onNavigate) onNavigate(s, targetId || eventId); else navContext?.navigateTo(s, targetId || eventId);
  }, [onNavigate, navContext, eventId]);

  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);
  const toggleFaq = useCallback((idx: number) => {
    setOpenFaqIndices((p) => p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]);
  }, []);

  return (
    <div className="event-detail-screen w-full min-h-screen bg-canvas text-ink relative">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-8 pb-32 space-y-10">
        {renderEventDetailHero({ concert, onNavigate: handleNavigate })}
        {renderEventDetailTiers({ tiers: ticketTiers })}
        {renderEventDetailFaq({ faqItems, openIndices: openFaqIndices, onToggle: toggleFaq })}
      </div>
      {renderEventDetailStickyBar({ onSelectSeats: () => handleNavigate('seatmap') })}
    </div>
  );
};

export default EventDetailScreen;
