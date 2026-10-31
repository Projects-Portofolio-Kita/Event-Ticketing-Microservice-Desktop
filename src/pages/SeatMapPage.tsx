/**
 * @file SeatMapPage.tsx
 * @description Route page controller for seat selection interactive map.
 */
import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SeatMapScreen } from '../screens/SeatMapScreen';
import { useBooking } from '../context/BookingContext';
import { ScreenType } from '../types/navigation';

export const SeatMapPage: React.FC = () => {
  const { eventId = 'coldplay-2026' } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { openCheckout } = useBooking();

  const handleNavigate = useCallback((screen: ScreenType) => {
    if (screen === 'detail') {
      navigate(`/event/${eventId}`);
    } else if (screen === 'discover') {
      navigate('/');
    } else {
      navigate(`/${screen}`);
    }
  }, [navigate, eventId]);

  return (
    <SeatMapScreen
      onNavigate={handleNavigate}
      onProceedToPayment={openCheckout}
    />
  );
};

export default SeatMapPage;
