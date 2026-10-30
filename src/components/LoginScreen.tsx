import { FC, FormEvent, useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { Session, login, register } from '../services/auth';

interface LoginScreenProps {
  onLoggedIn: (session: Session) => void;
}

/**
 * Sign-in gate for the desktop app. Every booking and payment call from here
 * carries this session's access token, which booking/payment-service verify
 * server-side.
 */
export const LoginScreen: FC<LoginScreenProps> = ({ onLoggedIn }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const session =
        mode === 'login'
          ? await login(email.trim(), password)
          : await register({ name: name.trim(), email: email.trim(), password });
      onLoggedIn(session);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memproses permintaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <div className="brand-icon-box">
            <Ticket className="brand-icon" size={20} />
          </div>
          <span className="brand-name">TickId</span>
        </div>

        <h1 className="auth-title">{mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}</h1>
        <p className="auth-subtitle">
          Masuk untuk memesan tiket. Reservasi dan pembayaran terikat pada akun Anda.
        </p>

        {mode === 'register' && (
          <label className="auth-field">
            <span>Nama lengkap</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            autoComplete="email"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="auth-spinner" size={16} />}
          {mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
        >
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
