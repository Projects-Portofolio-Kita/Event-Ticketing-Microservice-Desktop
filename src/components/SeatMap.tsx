/**
 * @file SeatMap.tsx
 * @description Master interactive stadium seating plan with zoom, tiers, and status legend.
 */
import React from 'react';
import { mockSeats as defaultMockSeats } from '../data/mockSeats';
import {
  SeatMapProps, useSeatMapZoom, useSeatMapState,
  renderSeatMapBanner, renderSeatMapZoomBar, renderSeatMapStage, renderSeatMapTiers, renderSeatMapLegend
} from './seat_map/index';

export type { SeatMapProps };

export const SeatMap: React.FC<SeatMapProps> = (props) => {
  const { currentZoom, handleZoomIn, handleZoomOut, handleResetZoom } = useSeatMapZoom(props.zoom, props.onZoomChange);
  const { activeSelectedIds, seatsByTier, handleSeatClick, handleBack } = useSeatMapState(props, defaultMockSeats);

  return (
    <div className="seat-map-wrapper w-full">
      {props.showBanner !== false && renderSeatMapBanner({ onBack: handleBack })}
      {renderSeatMapZoomBar({ zoom: currentZoom, onZoomIn: handleZoomIn, onZoomOut: handleZoomOut, onReset: handleResetZoom })}
      <div className="stadium-viewport-container flex-1 overflow-auto relative">
        <div
          className="stadium-zoom-canvas min-h-full p-8 flex flex-col items-center origin-top transition-transform duration-300 ease-out"
          style={{ transform: `scale(${currentZoom})`, transformOrigin: 'top center' }}
        >
          {renderSeatMapStage()}
          {renderSeatMapTiers({ seatsByTier, selectedIds: activeSelectedIds, onSeatClick: handleSeatClick })}
        </div>
        {renderSeatMapZoomBar({ zoom: currentZoom, onZoomIn: handleZoomIn, onZoomOut: handleZoomOut, onReset: handleResetZoom, sticky: true })}
      </div>
      {renderSeatMapLegend()}
    </div>
  );
};

export default SeatMap;
