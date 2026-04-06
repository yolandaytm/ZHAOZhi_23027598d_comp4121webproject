import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { user, signIn, signUp, hasSupabaseEnv, error: authError } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/profile" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'login') {
        await signIn(form);
      } else {
        await signUp(form);
        setSuccess('Account created. You can sign in now.');
        setMode('login');
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell shell auth-layout-web">
      <section className="card auth-promo">
        <p className="eyebrow">HK Home Dishes</p>
        <h1>Order your meal, save your favourites, and track each order.</h1>
        <ul className="auth-promo__list">
          <li>Browse first, then sign in when you are ready.</li>
          <li>Your orders and coins stay with your account.</li>
          <li>Shops can use a separate merchant sign in.</li>
        </ul>
      </section>

      <section className="card auth-card auth-card--desktop">
        <p className="eyebrow">Account</p>
        <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <p className="muted">Use one account for orders, saved meals, and coins.</p>

        {!hasSupabaseEnv && <div className="alert alert--warning">Sign in is not ready on this device yet.</div>}
        {error && <div className="alert alert--error">{error}</div>}
        {authError && <div className="alert alert--error">{authError}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>
              Full name
              <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
          </label>
          <button className="primary-btn" disabled={loading || !hasSupabaseEnv}>{loading ? 'Please wait' : mode === 'login' ? 'Sign in' : 'Sign up'}</button>
        </form>

        <div className="auth-card__actions">
          <button className="ghost-btn auth-toggle" onClick={() => setMode((current) => (current === 'login' ? 'signup' : 'login'))}>
            {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
          <Link className="ghost-btn auth-toggle" to="/merchant-login">Merchant sign in</Link>
        </div>
      </section>
    </div>
  );
}
