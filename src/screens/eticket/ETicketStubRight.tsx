/**
 * @file ETicketStubRight.tsx
 * @description Renders perforated ticket divider, gate QR code, 58 animated barcode bars, and anti-screenshot note.
 */
import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { QrCode } from '../../components/QrCode';

interface RightStubProps {
  barcodeBars: number[];
}

export const renderETicketStubRight = ({ barcodeBars }: RightStubProps): React.ReactElement => (
  <>
    <div className="relative flex lg:flex-col items-center justify-between lg:w-0 border-t-2 lg:border-t-0 lg:border-r-2 border-dashed border-line">
      <div className="lg:hidden absolute -left-4 -top-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />
      <div className="lg:hidden absolute -right-4 -top-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />
    </div>
    <div className="w-full lg:w-[300px] bg-panel p-6 sm:p-8 flex flex-col items-center justify-between border-l-0 lg:border-l border-line">
      <div className="text-center w-full">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink-muted block mb-1">Scan di Pintu Masuk</span>
        <span className="text-xs font-semibold text-indigo block mb-4">GATE 3B · SCAN DI GATE</span>
        <div className="qr-container p-3 bg-white rounded-2xl border border-line shadow-card inline-block mb-3">
          <QrCode size={140} seed={21} className="w-[140px] h-[140px]" />
        </div>
        <div className="text-[11px] font-mono text-ink-muted mb-2">ID: TICK-98214-GBK</div>
      </div>
      <div className="w-full my-3">
        <div className="barcode-container flex items-center justify-center h-12 w-full px-2 py-1 bg-white rounded-xl border border-line overflow-hidden" title="Barcode Gate Scanner">
          {barcodeBars.map((w, idx) => (
            <div key={`bar-${idx}`} className="barcode-bar h-10 bg-ink rounded-xs mx-[0.5px] breathe" style={{ width: `${w}px`, animationDelay: `${(idx % 10) * 0.1}s` }} />
          ))}
        </div>
        <div className="text-center font-mono text-[10px] text-ink-muted tracking-widest mt-1">9821 · 4001 · 2026 · 8892</div>
      </div>
      <div className="anti-screenshot-notice w-full mt-2 p-2.5 bg-amber/10 border border-amber/30 rounded-xl text-[11px] text-amber flex items-start gap-2">
        <AlertOctagon size={15} className="shrink-0 mt-0.5" />
        <p className="leading-tight">Dilarang mengambil tangkapan layar (screenshot). Tunjukkan e-ticket langsung dari aplikasi saat masuk gate.</p>
      </div>
    </div>
  </>
);
