/**
 * @file SeatMapScreen.tsx
 * @description Coordinates stadium SeatMap and dynamic OrderSummary sidebar in desktop layout.
 */
import React, { useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { SeatMap } from '../components/SeatMap';
import { OrderSummary } from '../components/OrderSummary';
import { SeatMapScreenProps, renderSeatMapScreenHeader } from './seat_map/index';

export type { SeatMapScreenProps };

export const SeatMapScreen: React.FC<SeatMapScreenProps> = ({
  onNavigate, onProceedToPayment, seats, selectedSeats, onToggleSeat, onRemoveSeat
}) => {
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try { navContext = useNavigation(); } catch { navContext = null; }

  const handleBack = useCallback(() => {
    if (onNavigate) onNavigate('detail'); else navContext?.navigateTo('detail');
  }, [onNavigate, navContext]);

  return (
    <div className="seat-map-screen flex h-[calc(100vh-68px)] w-full overflow-hidden bg-canvas text-ink">
      <div className="seat-map-main-column flex-1 flex flex-col min-w-0 bg-panel overflow-hidden">
        {renderSeatMapScreenHeader({ onBack: handleBack })}
        <SeatMap seats={seats} onBack={handleBack} onToggleSeat={onToggleSeat} showBanner={false} />
      </div>
      <aside className="order-summary-sidebar-column w-[360px] shrink-0 h-full bg-canvas border-l border-line flex flex-col overflow-hidden">
        <OrderSummary selectedSeats={selectedSeats} onRemoveSeat={onRemoveSeat} onProceedToPayment={onProceedToPayment} />
      </aside>
    </div>
  );
};

export default SeatMapScreen;
