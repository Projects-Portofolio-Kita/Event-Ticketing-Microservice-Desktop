/**
 * QrCode Component for TickId Desktop Application
 * Algorithmic SVG 25x25 QR code matrix generator with 3 position detection patterns,
 * deterministic pseudo-random data modules based on seed, and center brand badge.
 * Pure React SVG rendering with 0 external dependencies.
 */

import React, { useMemo } from 'react';

export interface QrCodeProps {
  size?: number;
  seed?: number;
  className?: string;
}

const MATRIX_SIZE = 25;

export const QrCode: React.FC<QrCodeProps> = ({
  size = 190,
  seed = 21,
  className = ''
}) => {
  // Generate 25x25 QR code matrix
  const matrix = useMemo(() => {
    // 25x25 grid initialized to false (light)
    const grid: boolean[][] = Array.from({ length: MATRIX_SIZE }, () =>
      Array(MATRIX_SIZE).fill(false)
    );

    // Reserved cell tracker (finders, separators, timing, center badge)
    const reserved: boolean[][] = Array.from({ length: MATRIX_SIZE }, () =>
      Array(MATRIX_SIZE).fill(false)
    );

    // Helper to draw 7x7 finder pattern at (ox, oy)
    const applyFinder = (ox: number, oy: number) => {
      // 1. Mark 8x8 separator region as reserved (light)
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const x = ox + dx;
          const y = oy + dy;
          if (x >= 0 && x < MATRIX_SIZE && y >= 0 && y < MATRIX_SIZE) {
            reserved[y][x] = true;
            grid[y][x] = false;
          }
        }
      }

      // 2. Draw 7x7 finder: 7x7 outer black, 5x5 white ring, 3x3 inner black
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const x = ox + dx;
          const y = oy + dy;
          reserved[y][x] = true;

          const isOuterBorder = dx === 0 || dx === 6 || dy === 0 || dy === 6;
          const isInnerSquare = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;

          grid[y][x] = isOuterBorder || isInnerSquare;
        }
      }
    };

    // Apply the 3 corner position detection patterns
    applyFinder(0, 0);   // Top-Left
    applyFinder(18, 0);  // Top-Right
    applyFinder(0, 18);  // Bottom-Left

    // Timing patterns: Row 6 and Col 6 (between finders)
    for (let i = 8; i < 17; i++) {
      // Horizontal timing pattern
      reserved[6][i] = true;
      grid[6][i] = i % 2 === 0;

      // Vertical timing pattern
      reserved[i][6] = true;
      grid[i][6] = i % 2 === 0;
    }

    // Center 5x5 badge area (reserved for brand badge)
    for (let y = 10; y <= 14; y++) {
      for (let x = 10; x <= 14; x++) {
        reserved[y][x] = true;
        grid[y][x] = false;
      }
    }

    // Pseudo-random number generator for data modules
    let currentSeed = typeof seed === 'number' ? Math.abs(seed) : 21;
    if (currentSeed === 0) currentSeed = 21;

    for (let y = 0; y < MATRIX_SIZE; y++) {
      for (let x = 0; x < MATRIX_SIZE; x++) {
        if (!reserved[y][x]) {
          // Linear congruential generator (LCG)
          currentSeed = (currentSeed * 9301 + 49297) % 233280;
          const rand = currentSeed / 233280;
          grid[y][x] = rand > 0.46;
        }
      }
    }

    return grid;
  }, [seed]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MATRIX_SIZE} ${MATRIX_SIZE}`}
      className={`qr-code-svg rounded-xl ${className}`}
      role="img"
      aria-label="QR Code Matrix"
    >
      {/* White background canvas */}
      <rect
        x="0"
        y="0"
        width={MATRIX_SIZE}
        height={MATRIX_SIZE}
        fill="#ffffff"
        rx="1"
      />

      {/* QR Code dark modules */}
      {matrix.map((row, y) =>
        row.map((isDark, x) => {
          if (!isDark) return null;
          return (
            <rect
              key={`mod-${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill="#0f172a"
            />
          );
        })
      )}

      {/* Center Brand Badge (Stylized TickId Ticket Icon) */}
      <g className="qr-brand-badge">
        {/* White pill background */}
        <rect
          x="9.5"
          y="9.5"
          width="6"
          height="6"
          rx="1.2"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="0.25"
        />

        {/* Indigo Ticket Badge */}
        <rect
          x="10.4"
          y="11.1"
          width="4.2"
          height="2.8"
          rx="0.5"
          fill="#4f46e5"
        />

        {/* Ticket Perforation Notches */}
        <circle cx="10.4" cy="12.5" r="0.45" fill="#ffffff" />
        <circle cx="14.6" cy="12.5" r="0.45" fill="#ffffff" />

        {/* Center ticket divider dashed line */}
        <line
          x1="12.5"
          y1="11.5"
          x2="12.5"
          y2="13.5"
          stroke="#ffffff"
          strokeWidth="0.35"
          strokeDasharray="0.3 0.3"
        />
      </g>
    </svg>
  );
};

export default QrCode;
