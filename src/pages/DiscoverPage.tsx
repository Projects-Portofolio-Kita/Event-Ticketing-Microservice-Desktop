import { useEffect, useState, type FC } from 'react';
import { SearchX, Loader2, RefreshCw, X } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { DiscoveryFilters, EventSummary } from '../types/booking';
import { fetchEvents } from '../services/api';
import { EVENT_CATEGORIES, categoryLabel } from '../data/categories';

interface DiscoverPageProps {
  filters: DiscoveryFilters;
  onFiltersChange: (patch: Partial<DiscoveryFilters>) => void;
  showToast: (message: string) => void;
}

/**
 * The discovery grid: free-text search, location and category filters all
 * resolve against catalog-service (GET /api/v1/events).
 */
export const DiscoverPage: FC<DiscoverPageProps> = ({ filters, onFiltersChange, showToast }) => {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchEvents({ q: filters.q || undefined, city: filters.city || undefined, category: filters.category || undefined })
      .then((result) => {
        if (cancelled) return;
        setEvents(result.events);
        setTotal(result.total);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Gagal memuat event.';
        setError(message);
        setEvents([]);
        setTotal(0);
        showToast(message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, showToast]);

  const hasActiveFilter = Boolean(filters.q || filters.city || filters.category);

  const heading = filters.q
    ? `Hasil untuk “${filters.q}”`
    : filters.city
      ? `Event di ${filters.city}`
      : filters.category
        ? `Kategori ${categoryLabel(filters.category)}`
        : 'Jelajahi Event';

  return (
    <section className="page-scroll discover-page">
      <div className="discover-hero">
        <div>
          <h1 className="page-title">{heading}</h1>
          <p className="page-subtitle">
            {isLoading ? 'Memuat event...' : `${total} event ditemukan`}
          </p>
        </div>

        <div className="category-chip-row">
          <button
            className={`category-chip ${filters.category === '' ? 'active' : ''}`}
            onClick={() => onFiltersChange({ category: '' })}
          >
            Semua
          </button>
          {EVENT_CATEGORIES.map((category) => (
            <button
              key={category.value}
              className={`category-chip ${filters.category === category.value ? 'active' : ''}`}
              onClick={() =>
                onFiltersChange({
                  category: filters.category === category.value ? '' : category.value,
                })
              }
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilter && (
        <div className="active-filter-row">
          {filters.q && (
            <button className="filter-chip" onClick={() => onFiltersChange({ q: '' })}>
              “{filters.q}” <X size={13} />
            </button>
          )}
          {filters.city && (
            <button className="filter-chip" onClick={() => onFiltersChange({ city: '' })}>
              {filters.city} <X size={13} />
            </button>
          )}
          {filters.category && (
            <button className="filter-chip" onClick={() => onFiltersChange({ category: '' })}>
              {categoryLabel(filters.category)} <X size={13} />
            </button>
          )}
          <button className="clear-all-filters" onClick={() => onFiltersChange({ q: '', city: '', category: '' })}>
            Hapus semua filter
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="state-box">
          <Loader2 size={28} className="animate-spin" />
          <p>Memuat event dari catalog-service...</p>
        </div>
      ) : error ? (
        <div className="state-box error">
          <SearchX size={30} />
          <p>{error}</p>
          <button className="retry-btn" onClick={() => onFiltersChange({})}>
            <RefreshCw size={15} /> Coba lagi
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="state-box">
          <SearchX size={30} />
          <p>Tidak ada event yang cocok. Coba kata kunci, kota, atau kategori lain.</p>
          <button
            className="retry-btn"
            onClick={() => onFiltersChange({ q: '', city: '', category: '' })}
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DiscoverPage;
