/**
 * @file use_seat_map_zoom.ts
 * @description Hook managing zoom factor and clamping between 0.7x and 1.4x.
 */
import { useState, useCallback } from 'react';

export function useSeatMapZoom(externalZoom?: number, onZoomChange?: (z: number) => void) {
  const [internalZoom, setInternalZoom] = useState(1.0);
  const currentZoom = externalZoom !== undefined ? externalZoom : internalZoom;

  const handleZoomIn = useCallback(() => {
    setInternalZoom((prev) => {
      const base = externalZoom !== undefined ? externalZoom : prev;
      const next = +(Math.min(1.4, +(base + 0.1).toFixed(2))).toFixed(2);
      onZoomChange?.(next);
      return next;
    });
  }, [externalZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    setInternalZoom((prev) => {
      const base = externalZoom !== undefined ? externalZoom : prev;
      const next = +(Math.max(0.7, +(base - 0.1).toFixed(2))).toFixed(2);
      onZoomChange?.(next);
      return next;
    });
  }, [externalZoom, onZoomChange]);

  const handleResetZoom = useCallback(() => {
    setInternalZoom(1.0);
    onZoomChange?.(1.0);
  }, [onZoomChange]);

  return { currentZoom, handleZoomIn, handleZoomOut, handleResetZoom };
}
