/**
 * @file EventDetailFaq.tsx
 * @description Renders terms and purchase FAQ accordion with plus/minus toggles.
 */
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { FaqItem } from '../../types/event';

interface FaqProps {
  faqItems: FaqItem[];
  openIndices: number[];
  onToggle: (idx: number) => void;
}

export const renderEventDetailFaq = ({ faqItems, openIndices, onToggle }: FaqProps): React.ReactElement => (
  <section className="pt-2">
    <h2 className="font-display text-xl font-bold mb-4 text-ink">Ketentuan &amp; Syarat Pembelian</h2>
    <div className="faq-list max-w-3xl divide-y divide-line border border-line rounded-2xl overflow-hidden bg-canvas">
      {faqItems.map((faq, idx) => {
        const isOpen = openIndices.includes(idx);
        return (
          <div key={faq.q || idx} className="faq-accordion-item">
            <button
              onClick={() => onToggle(idx)}
              className="faq-header-btn w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-panel transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="faq-question text-[14px] font-medium text-ink">{faq.q}</span>
              {isOpen ? <Minus size={16} className="faq-toggle-minus text-indigo shrink-0" /> : <Plus size={16} className="faq-toggle-plus text-ink-muted shrink-0" />}
            </button>
            {isOpen && <p className="faq-answer-body px-5 pb-4 text-[13px] leading-relaxed text-ink-soft">{faq.a}</p>}
          </div>
        );
      })}
    </div>
  </section>
);
