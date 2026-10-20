/**
 * Mock Digital E-Ticket Pass Data for TickId Desktop Application
 * Matches Figma host app E-Ticket screen specification (#TICK-ID-98214)
 */

import { ETicketData } from '../types/ticket';

export const mockETicketData: ETicketData = {
  referenceId: '#TICK-ID-98214',
  passType: 'VIP ALL-ACCESS PASS',
  eventTitle: 'COLDPLAY',
  eventSubtitle: 'MUSIC OF THE SPHERES',
  metadata: [
    { k: 'TANGGAL', v: '14 NOV 2026' },
    { k: 'OPEN GATE', v: '16:00 WIB' },
    { k: 'PINTU MASUK', v: 'GATE 3B' },
    { k: 'KATEGORI', v: 'CAT 1 VIP' },
    { k: 'KURSI', v: 'ROW C · NO 14 & 15' }
  ],
  buyer: {
    name: 'Fajrul Rahman',
    email: 'fajrul@example.com',
    isVerified: true,
    statusBadge: 'KYC Verified'
  },
  gateLabel: 'SCAN DI GATE',
  qrCodeSeed: 21,
  barcodeCount: 58,
  securityNotice: 'Tunjukkan barcode ini kepada petugas di pintu masuk gate. Anti-screenshot aktif.'
};
