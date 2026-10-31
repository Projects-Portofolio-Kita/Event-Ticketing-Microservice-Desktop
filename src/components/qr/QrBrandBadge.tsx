/**
 * @file QrBrandBadge.tsx
 * @description Stylized TickId ticket badge rendered at the center of QR code.
 */
import React from 'react';

export const QrBrandBadge: React.FC = () => (
  <g className="qr-brand-badge">
    <rect x="9.5" y="9.5" width="6" height="6" rx="1.2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.25" />
    <rect x="10.4" y="11.1" width="4.2" height="2.8" rx="0.5" fill="#4f46e5" />
    <circle cx="10.4" cy="12.5" r="0.45" fill="#ffffff" />
    <circle cx="14.6" cy="12.5" r="0.45" fill="#ffffff" />
    <line x1="12.5" y1="11.5" x2="12.5" y2="13.5" stroke="#ffffff" strokeWidth="0.35" strokeDasharray="0.3 0.3" />
  </g>
);
