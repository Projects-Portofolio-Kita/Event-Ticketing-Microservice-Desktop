/**
 * ETicketPage - Route Controller for #/tickets and #/tickets/:bookingRef?
 * Connects route parameters and BookingContext to ETicketScreen
 */
import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ETicketScreen } from '../screens/ETicketScreen';
import { useBooking } from '../context/BookingContext';
import { mockETicketData } from '../data/mockTickets';
import { ScreenType } from '../types/navigation';

export const ETicketPage: React.FC = () => {
  const { bookingRef } = useParams<{ bookingRef?: string }>();
  const navigate = useNavigate();
  const { selectedSeats } = useBooking();

  const handleNavigate = useCallback((screen: ScreenType) => {
    if (screen === 'discover') {
      navigate('/');
    } else {
      navigate(`/${screen}`);
    }
  }, [navigate]);

  return (
    <ETicketScreen
      onNavigate={handleNavigate}
      selectedSeats={selectedSeats}
      {...(bookingRef
        ? {
            ticketData: {
              ...mockETicketData,
              referenceId: bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`
            }
          }
        : {})}
    />
  );
};

export default ETicketPage;
