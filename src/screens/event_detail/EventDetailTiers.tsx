/**
 * @file EventDetailTiers.tsx
 * @description Renders ticket category cards list and schematic stage layout diagram.
 */
import React from 'react';
import { TicketTierItem } from '../../types/event';
import { formatRupiah } from '../../utils/format';

interface TiersProps {
  tiers: TicketTierItem[];
}

export const renderEventDetailTiers = ({ tiers }: TiersProps): React.ReactElement => (
  <section className="pt-2">
    <h2 className="font-display text-xl font-bold mb-4 text-ink">Kategori Tiket &amp; Denah Kasar</h2>
    <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-start">
      <div className="space-y-2.5">
        {tiers.map((e) => {
          const toneClass = e.tone === 'sold' || e.status === 'Habis' ? 'text-ink-muted bg-subtle line-through' : e.tone === 'warn' || e.status === 'Sisa Sedikit' ? 'text-amber bg-amber/10' : 'text-emerald bg-emerald-tint';
          const priceStr = typeof e.price === 'number' ? formatRupiah(e.price) : e.price;
          return (
            <div key={e.name} className="ticket-tier-item flex items-center justify-between bg-panel border border-line rounded-xl px-4 py-3">
              <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: e.color }} /><span className="text-[14px] font-medium text-ink">{e.name}</span></div>
              <div className="flex items-center gap-3"><span className="font-display font-bold text-[14px] text-ink">{priceStr}</span><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${toneClass}`}>{e.status}</span></div>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border border-line bg-panel p-6 grid place-items-center">
        <div className="w-full max-w-xs">
          <div className="h-8 rounded-t-[100%] grid place-items-center text-[10px] font-semibold tracking-[0.25em] text-indigo bg-indigo/10 border border-indigo/20 border-b-0">
            <span className="sr-only">PANGGUNG UTAMA / STAGE</span>PANGGUNG
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#7c3aed]">CAT 1</div>
            <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#4f46e5]">CAT 2</div>
            <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#06b6d4]">CAT 3</div>
            <div className="h-6 rounded flex items-center justify-center text-[9px] font-semibold text-white bg-[#94a3b8] opacity-40">CAT 4</div>
          </div>
          <p className="denah-disclaimer text-[11px] text-ink-muted text-center mt-3">Denah kasar · tidak sesuai skala</p>
        </div>
      </div>
    </div>
  </section>
);
