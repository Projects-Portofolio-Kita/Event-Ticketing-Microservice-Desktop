import { useEffect, useMemo, useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { createEvent, fetchCities } from '../services/api';
import { CityEntry, CreateEventPayload, SaleMode } from '../types/booking';
import { EVENT_CATEGORIES } from '../data/categories';

interface CreateEventPageProps {
  showToast: (message: string) => void;
}

interface TierDraft {
  name: string;
  price: string;
  quota: string;
  description: string;
}

const emptyTier = (): TierDraft => ({ name: '', price: '', quota: '', description: '' });

/** concert/theater default to a numbered seat map, everything else to tiers. */
const defaultModeFor = (category: string): SaleMode =>
  category === 'concert' || category === 'theater' ? 'SEATED' : 'TIER';

/**
 * Publish form: any signed-in user may create an event and sell tickets with
 * their own tiers. Prices and quotas are stored by catalog-service — clients
 * never price a ticket at checkout.
 */
export const CreateEventPage: FC<CreateEventPageProps> = ({ showToast }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('concert');
  const [saleMode, setSaleMode] = useState<SaleMode>(defaultModeFor('concert'));
  const [saleModeTouched, setSaleModeTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [payoutBank, setPayoutBank] = useState('');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutName, setPayoutName] = useState('');
  const [tiers, setTiers] = useState<TierDraft[]>([
    { name: 'VVIP', price: '', quota: '', description: '' },
    { name: 'VIP', price: '', quota: '', description: '' },
    { name: 'Regular', price: '', quota: '', description: '' },
  ]);

  const [cities, setCities] = useState<CityEntry[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCities().then(setCities);
  }, []);

  const isTierMode = saleMode === 'TIER';

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (!saleModeTouched) setSaleMode(defaultModeFor(value));
  };

  const updateTier = (index: number, patch: Partial<TierDraft>) => {
    setTiers((prev) => prev.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  };

  const payoutFilled = useMemo(
    () => [payoutBank, payoutAccount, payoutName].filter((v) => v.trim() !== '').length,
    [payoutBank, payoutAccount, payoutName]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim() || !venue.trim() || !eventDate) {
      setFormError('Nama event, venue, dan tanggal wajib diisi.');
      return;
    }
    if (posterUrl.trim() && !/^https?:\/\//i.test(posterUrl.trim())) {
      setFormError('Poster URL harus diawali http:// atau https://.');
      return;
    }
    if (payoutFilled > 0 && payoutFilled < 3) {
      setFormError('Data rekening payout harus lengkap (bank, no rekening, dan nama pemilik).');
      return;
    }

    const cleanedTiers = tiers
      .map((tier) => ({
        name: tier.name.trim(),
        price: Number(tier.price),
        quota: Number(tier.quota),
        description: tier.description.trim(),
      }))
      .filter((tier) => tier.name !== '' || tier.price > 0);

    if (cleanedTiers.length === 0) {
      setFormError('Minimal satu jenis tiket / kategori harus diisi.');
      return;
    }
    for (const tier of cleanedTiers) {
      if (Number.isNaN(tier.price) || tier.price < 0) {
        setFormError(`Harga "${tier.name || 'tiket'}" tidak valid.`);
        return;
      }
      if (isTierMode && (!Number.isInteger(tier.quota) || tier.quota < 1)) {
        setFormError(`Kuota "${tier.name}" wajib diisi minimal 1.`);
        return;
      }
    }

    const payload: CreateEventPayload = {
      name: name.trim(),
      venue: venue.trim(),
      eventDate: new Date(eventDate).toISOString(),
      city: city.trim() || undefined,
      category,
      saleMode,
      description: description.trim() || undefined,
      posterUrl: posterUrl.trim() || undefined,
      payoutBankName: payoutBank.trim() || undefined,
      payoutAccountNumber: payoutAccount.trim() || undefined,
      payoutAccountName: payoutName.trim() || undefined,
      categories: cleanedTiers.map((tier) => ({
        name: tier.name,
        price: tier.price,
        quota: isTierMode ? tier.quota : undefined,
        description: tier.description || undefined,
      })),
    };

    setIsSubmitting(true);
    try {
      const created = await createEvent(payload);
      showToast(`Event "${created.name}" berhasil dibuat!`);
      navigate(`/event/${created.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat event.';
      setFormError(message);
      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-scroll create-event-page">
      <div className="form-page-header">
        <div className="form-page-title">
          <Sparkles size={20} />
          <div>
            <h1 className="page-title">Buat Event Baru</h1>
            <p className="page-subtitle">
              Event Anda tampil di halaman jelajah dan bisa dibeli siapa saja.
            </p>
          </div>
        </div>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        {/* Basic info */}
        <fieldset className="form-card">
          <legend className="form-card-title">Informasi Event</legend>

          <div className="form-grid">
            <label className="form-field span-2">
              <span>Nama event *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. Java Jazz Festival 2027"
                maxLength={255}
                required
              />
            </label>

            <label className="form-field">
              <span>Venue *</span>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="cth. JIExpo Kemayoran"
                maxLength={255}
                required
              />
            </label>

            <label className="form-field">
              <span>Tanggal & waktu *</span>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span>Kota</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="cth. Jakarta"
                list="city-suggestions"
                maxLength={100}
              />
              <datalist id="city-suggestions">
                {cities.map((entry) => (
                  <option key={entry.city} value={entry.city} />
                ))}
              </datalist>
            </label>

            <label className="form-field">
              <span>Kategori</span>
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                {EVENT_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field span-2">
              <span>Poster (URL gambar)</span>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://..."
                maxLength={512}
              />
            </label>

            <label className="form-field span-2">
              <span>Deskripsi</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan event Anda..."
                rows={4}
                maxLength={2000}
              />
            </label>
          </div>
        </fieldset>

        {/* Sale mode */}
        <fieldset className="form-card">
          <legend className="form-card-title">Cara Penjualan Tiket</legend>
          <div className="sale-mode-row">
            <button
              type="button"
              className={`sale-mode-option ${saleMode === 'TIER' ? 'active' : ''}`}
              onClick={() => {
                setSaleMode('TIER');
                setSaleModeTouched(true);
              }}
            >
              <strong>Kuota Tiket (VIP / VVIP / Regular)</strong>
              <span>Setiap tiket punya kuota. Cocok untuk festival, seminar, olahraga, workshop.</span>
            </button>
            <button
              type="button"
              className={`sale-mode-option ${saleMode === 'SEATED' ? 'active' : ''}`}
              onClick={() => {
                setSaleMode('SEATED');
                setSaleModeTouched(true);
              }}
            >
              <strong>Denah Kursi (nomor kursi)</strong>
              <span>Penonton memilih kursi bernomor. Cocok untuk konser dan teater.</span>
            </button>
          </div>
        </fieldset>

        {/* Tiers / categories */}
        <fieldset className="form-card">
          <legend className="form-card-title">
            {isTierMode ? 'Jenis Tiket & Kuota' : 'Kategori Kursi & Harga'}
          </legend>

          <div className="tier-editor-head">
            <span>Nama</span>
            <span>Harga (Rp)</span>
            {isTierMode && <span>Kuota</span>}
            <span>Deskripsi</span>
            <span />
          </div>

          {tiers.map((tier, index) => (
            <div className="tier-editor-row" key={index}>
              <input
                type="text"
                value={tier.name}
                onChange={(e) => updateTier(index, { name: e.target.value })}
                placeholder="cth. VVIP"
                maxLength={100}
              />
              <input
                type="number"
                value={tier.price}
                onChange={(e) => updateTier(index, { price: e.target.value })}
                placeholder="0"
                min={0}
                step={1000}
              />
              {isTierMode && (
                <input
                  type="number"
                  value={tier.quota}
                  onChange={(e) => updateTier(index, { quota: e.target.value })}
                  placeholder="cth. 100"
                  min={1}
                />
              )}
              <input
                type="text"
                value={tier.description}
                onChange={(e) => updateTier(index, { description: e.target.value })}
                placeholder="cth. Area premium berdiri"
                maxLength={500}
              />
              <button
                type="button"
                className="tier-row-remove"
                title="Hapus baris"
                disabled={tiers.length === 1}
                onClick={() => setTiers((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="add-tier-btn"
            onClick={() => setTiers((prev) => [...prev, emptyTier()])}
          >
            <Plus size={15} /> Tambah {isTierMode ? 'Jenis Tiket' : 'Kategori'}
          </button>
        </fieldset>

        {/* Payout */}
        <fieldset className="form-card">
          <legend className="form-card-title">Informasi Payout (opsional)</legend>
          <p className="form-hint">Diisi lengkap agar hasil penjualan bisa dicairkan.</p>
          <div className="form-grid">
            <label className="form-field">
              <span>Nama bank</span>
              <input
                type="text"
                value={payoutBank}
                onChange={(e) => setPayoutBank(e.target.value)}
                placeholder="cth. BCA"
                maxLength={100}
              />
            </label>
            <label className="form-field">
              <span>Nomor rekening</span>
              <input
                type="text"
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
                placeholder="cth. 1234567890"
                maxLength={50}
              />
            </label>
            <label className="form-field">
              <span>Nama pemilik</span>
              <input
                type="text"
                value={payoutName}
                onChange={(e) => setPayoutName(e.target.value)}
                placeholder="cth. PT Panggung Nusantara"
                maxLength={100}
              />
            </label>
          </div>
        </fieldset>

        {formError && (
          <div className="form-error-banner">
            <AlertTriangle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
            Batal
          </button>
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Membuat Event...
              </>
            ) : (
              <>
                <Plus size={16} /> Publikasikan Event
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateEventPage;
