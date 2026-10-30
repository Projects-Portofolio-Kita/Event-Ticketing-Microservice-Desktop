import type { FC } from 'react';
import { Minus, Plus, Ticket } from 'lucide-react';
import { TicketType } from '../types/booking';

interface TicketTierSelectorProps {
  ticketTypes: TicketType[];
  /** categoryId -> how many tickets the user wants of that tier. */
  quantities: Record<string, number>;
  onChange: (categoryId: string, quantity: number) => void;
}

/** The server also caps one basket at 10 tickets (per reservation). */
const MAX_PER_RESERVATION = 10;

/** Same dot palette catalog-service cycles through its categories. */
const TIER_COLORS = [
  '#f59e0b',
  '#8b5cf6',
  '#10b981',
  '#0ea5e9',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#84cc16',
  '#f97316',
];

const formatRupiah = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

/**
 * Quota-based ticket picker for TIER events: one card per tier (VIP, VVIP,
 * Regular or whatever the poster named it) with a quantity stepper. No round
 * seat circles here — availability is stock, not seats.
 */
export const TicketTierSelector: FC<TicketTierSelectorProps> = ({
  ticketTypes,
  quantities,
  onChange,
}) => {
  const totalPicked = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handleStep = (ticket: TicketType, next: number) => {
    const current = quantities[ticket.categoryId] ?? 0;
    // Stock may never be exceeded, and one basket holds at most 10 tickets.
    const perTierCap = Math.min(Math.max(ticket.remaining, 0), MAX_PER_RESERVATION);
    const basketRoom = current + Math.max(0, MAX_PER_RESERVATION - totalPicked);
    const maxAllowed = Math.min(perTierCap, basketRoom);

    onChange(ticket.categoryId, Math.max(0, Math.min(next, maxAllowed)));
  };

  if (ticketTypes.length === 0) {
    return (
      <div className="state-box">
        <Ticket size={28} />
        <p>Event ini belum membuka penjualan tiket.</p>
      </div>
    );
  }

  return (
    <div className="tier-list">
      <div className="tier-notice">
        Pilih jenis tiket dan jumlahnya. Kuota tiket langsung terpotong dari server saat Anda
        melanjutkan ke pembayaran.
      </div>

      {ticketTypes.map((ticket, index) => {
        const quantity = quantities[ticket.categoryId] ?? 0;
        const color = TIER_COLORS[index % TIER_COLORS.length];
        const soldOut = ticket.remaining <= 0;
        const lowStock = !soldOut && ticket.remaining <= 10;
        // Never allow more than stock or more than the per-basket cap.
        const cap = Math.min(ticket.remaining, MAX_PER_RESERVATION);

        return (
          <div
            key={ticket.categoryId}
            className={`tier-card ${soldOut ? 'sold-out' : ''} ${quantity > 0 ? 'picked' : ''}`}
          >
            <span className="tier-dot" style={{ backgroundColor: color }} />

            <div className="tier-info">
              <div className="tier-title-row">
                <span className="tier-name">{ticket.name}</span>
                {soldOut ? (
                  <span className="tier-stock-badge out">Habis</span>
                ) : lowStock ? (
                  <span className="tier-stock-badge low">Sisa {ticket.remaining}</span>
                ) : (
                  <span className="tier-stock-badge">Sisa {ticket.remaining}</span>
                )}
              </div>
              {ticket.description && <p className="tier-desc">{ticket.description}</p>}
              <span className="tier-price">{formatRupiah(ticket.price)}</span>
            </div>

            <div className="tier-stepper">
              <button
                type="button"
                className="stepper-btn"
                disabled={soldOut || quantity === 0}
                onClick={() => onChange(ticket.categoryId, Math.max(0, quantity - 1))}
                title="Kurangi"
              >
                <Minus size={15} />
              </button>
              <span className="stepper-value">{quantity}</span>
              <button
                type="button"
                className="stepper-btn"
                disabled={soldOut || quantity >= cap || totalPicked >= MAX_PER_RESERVATION}
                onClick={() => handleStep(ticket, quantity + 1)}
                title="Tambah"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        );
      })}

      {totalPicked >= MAX_PER_RESERVATION && (
        <div className="tier-cap-note">Maksimal {MAX_PER_RESERVATION} tiket per transaksi.</div>
      )}
    </div>
  );
};

export default TicketTierSelector;
