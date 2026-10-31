/**
 * @file BarcodeScannerBar.tsx
 * @description Barcode scanner bar component with animated dynamic bars.
 */
import React from 'react';
import { generateBarcodeBars } from '../utils/format';

export interface BarcodeScannerBarProps {
  count?: number;
  className?: string;
  height?: string;
}

export const BarcodeScannerBar: React.FC<BarcodeScannerBarProps> = ({
  count = 58,
  className = '',
  height = 'h-10'
}) => {
  const bars = generateBarcodeBars(count);

  return (
    <div
      className={`barcode-container flex items-center justify-center h-12 w-full px-2 py-1 bg-white rounded-xl border border-line overflow-hidden ${className}`}
      title="Barcode Gate Scanner"
      aria-label="Barcode Gate Scanner"
    >
      {bars.map((w, idx) => (
        <span
          key={idx}
          className={`barcode-bar ${height} bg-ink rounded-xs mx-[0.5px] breathe`}
          style={{ width: `${w}px`, animationDelay: `${(idx % 12) * 0.15}s` }}
        />
      ))}
    </div>
  );
};

export default BarcodeScannerBar;
