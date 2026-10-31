/**
 * @file SeatMapTiers.tsx
 * @description Renders main stage banner and the 4 category seating tiers.
 */
import React from 'react';
import { Seat, SeatTier } from '../../types/seat';
import { formatRupiah } from '../../utils/format';
import { renderTierRows } from './SeatMapRow';

interface TiersProps {
  seatsByTier: Record<SeatTier, Seat[]>;
  selectedIds: Set<string>;
  onSeatClick: (s: Seat) => void;
}

const TIER_META = [
  { key: 'cat1' as const, label: 'CAT 1', sub: '· VIP Soundcheck', title: 'CAT 1 — VIP Soundcheck', color: '#7c3aed', price: 3500000 },
  { key: 'cat2' as const, label: 'CAT 2', sub: '· Festival / Free Standing', title: 'CAT 2 — Festival / Free Standing', color: '#4f46e5', price: 2100000 },
  { key: 'cat3' as const, label: 'CAT 3', sub: '· Tribun Bawah', title: 'CAT 3 — Tribun Bawah', color: '#06b6d4', price: 1500000 },
  { key: 'cat4' as const, label: 'CAT 4', sub: '· Tribun Atas', title: 'CAT 4 — Tribun Atas', color: '#64748b', price: 750000 }
];

export const renderSeatMapStage = (): React.ReactElement => (
  <div className="w-2/3 max-w-2xl mb-8 mx-auto">
    <div
      className="h-14 rounded-t-[100%] grid place-items-center text-[12px] font-semibold tracking-[0.25em] text-indigo bg-indigo/8 border border-indigo/25 border-b-0"
      style={{ boxShadow: '0 -10px 30px -8px rgba(79,70,229,0.3)' }}
    >PANGGUNG UTAMA / STAGE</div>
  </div>
);

export const renderSeatMapTiers = ({ seatsByTier, selectedIds, onSeatClick }: TiersProps): React.ReactElement => (
  <div className="space-y-6 w-full max-w-4xl">
    {TIER_META.map((t) => (
      <div key={t.key}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="text-[13px] font-semibold text-ink"><span className="sr-only">{t.title}</span>{t.label}</span>
            <span className="text-[12px] text-ink-muted">{t.sub}</span>
          </div>
          <span className="font-mono text-[12px] text-ink-soft">{formatRupiah(t.price)}</span>
        </div>
        {renderTierRows(seatsByTier[t.key] || [], selectedIds, onSeatClick)}
      </div>
    ))}
  </div>
);