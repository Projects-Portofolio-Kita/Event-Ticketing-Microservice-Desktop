/**
 * DiscoverPage - Route Controller for #/ and #/discover
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { ScreenType } from '../types/navigation';

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = useCallback((screen: ScreenType, eventId?: string) => {
    switch (screen) {
      case 'detail':
        navigate(`/event/${eventId || 'coldplay-2026'}`);
        break;
      case 'categories':
        navigate('/categories');
        break;
      case 'seatmap':
        navigate(`/seatmap/${eventId || 'coldplay-2026'}`);
        break;
      case 'tickets':
        navigate('/tickets');
        break;
      default:
        navigate('/');
    }
  }, [navigate]);

  return <DiscoverScreen onNavigate={handleNavigate} />;
};

export default DiscoverPage;
