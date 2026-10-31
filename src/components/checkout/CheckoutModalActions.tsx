/**
 * @file CheckoutModalActions.tsx
 * @description Renders download QR, simulate pay, and cancel actions for CheckoutModal.
 */
import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

interface ActionsProps {
  downloadSuccess: boolean;
  onDownload: () => void;
  onSimulate: () => void;
  onCancel: () => void;
}

export const renderCheckoutModalActions = ({
  downloadSuccess, onDownload, onSimulate, onCancel
}: ActionsProps): React.ReactElement => (
  <div className="px-6 py-4 bg-canvas border-t border-line flex items-center justify-between">
    <button
      onClick={onDownload}
      className="btn-download-qris py-2.5 px-4 rounded-xl border border-line bg-white hover:bg-subtle text-xs font-semibold text-ink flex items-center gap-2 transition-colors cursor-pointer"
      aria-label="Download QRIS Gambar"
    >
      {downloadSuccess ? (
        <><CheckCircle2 size={14} className="text-emerald" /><span className="text-emerald">QR Code Tersimpan</span></>
      ) : (
        <><Download size={14} className="text-ink-soft" /><span>Download QRIS Gambar</span><span className="sr-only">Unduh QR Code</span></>
      )}
    </button>
    <button
      onClick={onSimulate}
      className="btn-simulate-pay py-2.5 px-6 rounded-xl bg-indigo hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
      aria-label="Simulasi Bayar"
    >
      <span>Simulasi Bayar ✓</span>
    </button>
    <button
      onClick={onCancel}
      className="btn-cancel-release text-xs font-semibold text-danger hover:underline transition-colors cursor-pointer"
      aria-label="Batalkan dan Lepas Kursi"
    >
      <span>Batalkan &amp; Lepas Kursi</span>
    </button>
  </div>
);
