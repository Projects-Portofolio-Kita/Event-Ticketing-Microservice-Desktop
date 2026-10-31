/**
 * @file EventDetailPage.tsx
 * @description Route page controller for viewing concert details and ticket tiers.
 */
import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { ScreenType } from '../types/navigation';

export const EventDetailPage: React.FC = () => {
  const { eventId = 'coldplay-2026' } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const handleNavigate = useCallback((screen: ScreenType, targetEventId?: string) => {
    const eid = targetEventId || eventId;
    switch (screen) {
      case 'seatmap':
        navigate(`/seatmap/${eid}`);
        break;
      case 'categories':
        navigate('/categories');
        break;
      case 'discover':
        navigate('/');
        break;
      default:
        navigate(`/${screen}`);
    }
  }, [navigate, eventId]);

  return <EventDetailScreen eventId={eventId} onNavigate={handleNavigate} />;
};

export default EventDetailPage;
