/**
 * @file ETicketScreen.tsx
 * @description Master e-ticket screen coordinating boarding pass stub, QR code, and export actions.
 */
import React from 'react';
import { Sparkles } from 'lucide-react';
import { mockETicketData } from '../data/mockTickets';
import { mockUser } from '../data/mockUser';
import {
  ETicketScreenProps,
  useETicketState,
  renderETicketSuccessBanner,
  renderETicketStubLeft,
  renderETicketStubRight,
  renderETicketActions,
} from './eticket/index';

export type { ETicketScreenProps };

export const ETicketScreen: React.FC<ETicketScreenProps> = ({ onNavigate, ticketData = mockETicketData, selectedSeats: propSeats }) => {
  const { toastMsg, showToast, handleHome, tierName, seatsListString, barcodeBars } = useETicketState(onNavigate, propSeats);

  return (
    <div className="eticket-screen w-full min-h-screen bg-canvas text-ink pb-24">
      {toastMsg && <div className="fixed top-6 right-6 z-50 bg-ink text-white px-4 py-2.5 rounded-xl shadow-pop text-sm font-semibold flex items-center gap-2 animate-bounce"><Sparkles size={16} className="text-amber" /><span>{toastMsg}</span></div>}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {renderETicketSuccessBanner({ ticketData, onBackHome: handleHome })}
        <div className="boarding-pass-card relative w-full bg-white rounded-3xl border border-line shadow-pop overflow-hidden flex flex-col lg:flex-row mb-8">
          <div className="hidden lg:block absolute left-[calc(100%-300px)] -top-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />
          <div className="hidden lg:block absolute left-[calc(100%-300px)] -bottom-4 w-8 h-8 rounded-full bg-canvas border border-line z-20" />
          {renderETicketStubLeft({ ticketData, tierName, seatsListString })}
          {renderETicketStubRight({ barcodeBars })}
        </div>
        {renderETicketActions({
          onSaveWallet: () => showToast('Tiket berhasil disinkronkan ke Apple/Google Wallet!'),
          onDownloadPdf: () => showToast('E-Ticket PDF berhasil diunduh ke perangkat!'),
          onSendEmail: () => showToast(`E-Ticket telah dikirimkan ke email ${ticketData.buyer?.email || mockUser.email}!`)
        })}
      </div>
    </div>
  );
};

export default ETicketScreen;
