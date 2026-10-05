import { useState, type FC } from 'react';
import { Flame, AlertTriangle, Clock, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { SeatCategory, Seat } from '../types/booking';

interface SeatMapProps {
  categories: SeatCategory[];
  onToggleSeat: (seat: Seat, categoryName: string, subtitle: string) => void;
  onSeatAlert: (msg: string) => void;
}

export const SeatMap: FC<SeatMapProps> = ({ categories, onToggleSeat, onSeatAlert }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 140));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 70));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleSeatClick = (seat: Seat, categoryName: string, subtitle: string) => {
    if (seat.status === 'locked') {
      onSeatAlert(`Kursi ${seat.row}${seat.number} (${categoryName}) sedang di-lock oleh penonton lain.`);
      return;
    }
    if (seat.status === 'sold') {
      onSeatAlert(`Kursi ${seat.row}${seat.number} (${categoryName}) sudah terjual.`);
      return;
    }
    onToggleSeat(seat, categoryName, subtitle);
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="seat-map-wrapper">
      {/* Event Header Banner */}
      <div className="seat-map-header">
        <div className="event-info">
          <h1 className="event-title">Coldplay 2026 — Pilih Kursi</h1>
          <p className="event-venue">Stadion Utama Gelora Bung Karno</p>
        </div>
        <div className="live-viewers-badge">
          <Flame size={15} className="live-icon" />
          <span>Live: 8.420 penonton sedang memilih kursi</span>
        </div>
      </div>

      {/* Lock Notice Banner */}
      <div className="alert-lock-banner">
        <AlertTriangle size={18} className="alert-icon" />
        <span>Kursi yang Anda klik akan di-lock selama 05:00 menit untuk menyelesaikan pembayaran.</span>
      </div>

      {/* Scrollable Canvas for Categories and Seats */}
      <div className="seat-scroll-container">
        <div
          className="seat-zoom-canvas"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {categories.map((cat) => (
            <div key={cat.id} className="category-section">
              {/* Category Header */}
              <div className="category-header">
                <div className="category-left">
                  <span className="cat-dot" style={{ backgroundColor: cat.dotColor }} />
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-separator">·</span>
                  <span className="cat-subtitle">{cat.subtitle}</span>
                </div>
                <div className="category-price">{formatRupiah(cat.price)}</div>
              </div>

              {/* Category Seat Card */}
              <div className="category-card">
                <div className="seat-grid">
                  {cat.rows.map((row) => (
                    <div key={row.rowName} className="seat-row">
                      {/* Left Block */}
                      <div className="seat-block left-block">
                        {row.leftSeats.map((seat) => (
                          <button
                            key={seat.id}
                            className={`seat-btn seat-${seat.status}`}
                            onClick={() => handleSeatClick(seat, cat.name, cat.subtitle)}
                            title={`${cat.name} - Row ${seat.row} No ${seat.number} (${seat.status})`}
                          >
                            {seat.status === 'locked' && <Clock size={11} className="seat-inner-icon" />}
                            {seat.status === 'sold' && <X size={11} className="seat-inner-icon" />}
                          </button>
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="seat-aisle" />

                      {/* Right Block */}
                      <div className="seat-block right-block">
                        {row.rightSeats.map((seat) => (
                          <button
                            key={seat.id}
                            className={`seat-btn seat-${seat.status}`}
                            onClick={() => handleSeatClick(seat, cat.name, cat.subtitle)}
                            title={`${cat.name} - Row ${seat.row} No ${seat.number} (${seat.status})`}
                          >
                            {seat.status === 'locked' && <Clock size={11} className="seat-inner-icon" />}
                            {seat.status === 'sold' && <X size={11} className="seat-inner-icon" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Zoom Controls Bar */}
      <div className="floating-controls">
        <button onClick={handleZoomOut} title="Perkecil" className="control-btn">
          <ZoomOut size={16} />
        </button>
        <span className="zoom-text" onClick={handleResetZoom} title="Reset zoom">{zoomLevel}%</span>
        <button onClick={handleZoomIn} title="Perbesar" className="control-btn">
          <ZoomIn size={16} />
        </button>
        <div className="control-divider" />
        <button onClick={handleResetZoom} title="Fit to Screen" className="control-btn">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Bottom Legend */}
      <footer className="seat-legend-bar">
        <div className="legend-item">
          <span className="legend-circle legend-available" />
          <span className="legend-label">Tersedia</span>
        </div>
        <div className="legend-item">
          <span className="legend-circle legend-selected" />
          <span className="legend-label">Dipilih Anda</span>
        </div>
        <div className="legend-item">
          <span className="legend-circle legend-locked">
            <Clock size={11} color="#ffffff" />
          </span>
          <span className="legend-label">Di-lock Orang Lain</span>
        </div>
        <div className="legend-item">
          <span className="legend-circle legend-sold">
            <X size={11} color="#64748b" />
          </span>
          <span className="legend-label">Terjual</span>
        </div>
      </footer>
    </div>
  );
};
