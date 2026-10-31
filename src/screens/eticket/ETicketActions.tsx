/**
 * @file ETicketActions.tsx
 * @description Renders action buttons to save to wallet, download PDF, or send email.
 */
import React from 'react';
import { Wallet, Download, Mail } from 'lucide-react';

interface ActionsProps {
  onSaveWallet: () => void;
  onDownloadPdf: () => void;
  onSendEmail: () => void;
}

export const renderETicketActions = ({
  onSaveWallet, onDownloadPdf, onSendEmail
}: ActionsProps): React.ReactElement => (
  <div className="ticket-actions flex flex-wrap items-center justify-center gap-3 pt-2">
    <button
      onClick={onSaveWallet}
      className="btn-save-wallet inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
      aria-label="Simpan ke Wallet"
    >
      <Wallet size={16} />
      <span>Simpan ke Wallet</span>
    </button>
    <button
      onClick={onDownloadPdf}
      className="btn-download-pdf inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-subtle border border-line text-xs sm:text-sm font-bold text-ink shadow-sm transition-all cursor-pointer"
      aria-label="Unduh PDF"
    >
      <Download size={16} />
      <span>Unduh PDF</span>
    </button>
    <button
      onClick={onSendEmail}
      className="btn-email-ticket inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-subtle border border-line text-xs sm:text-sm font-bold text-ink shadow-sm transition-all cursor-pointer"
      aria-label="Kirim ke Email"
    >
      <Mail size={16} />
      <span>Kirim ke Email</span>
    </button>
  </div>
);
