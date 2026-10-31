/**
 * @file QrCode.tsx
 * @description SVG QR code matrix component with 3 position patterns and brand badge.
 */
import React, { useMemo } from 'react';
import { MATRIX_SIZE, generateQRMatrix, QrBrandBadge } from './qr/index';

export interface QrCodeProps {
  size?: number;
  seed?: number;
  className?: string;
}

export const QrCode: React.FC<QrCodeProps> = ({ size = 190, seed = 21, className = '' }) => {
  const matrix = useMemo(() => generateQRMatrix(seed), [seed]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MATRIX_SIZE} ${MATRIX_SIZE}`}
      className={`qr-code-svg rounded-xl ${className}`}
      role="img"
      aria-label="QR Code Matrix"
    >
      <rect x="0" y="0" width={MATRIX_SIZE} height={MATRIX_SIZE} fill="#ffffff" rx="1" />
      {matrix.map((row, y) =>
        row.map((isDark, x) =>
          isDark ? <rect key={`mod-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" /> : null
        )
      )}
      <QrBrandBadge />
    </svg>
  );
};

export default QrCode;
