import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../lib/pricing.js';

export default function ProfilePage({ orders, savedPresets = [], onUsePreset }) {
  const { user, signOut } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;

  const completedOrders = (orders || []).filter((o) => o.status === 'delivered').length;
  const totalSpent = (orders || [])
    .filter((o) => o.status === 'delivered')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const accountItems = [
    { icon: '🍱', label: 'Saved custom meals', value: `${savedPresets.length} presets` },
    { icon: '🛎️', label: 'Order tracking', value: 'Active' },
    { icon: '⭐', label: 'Loyalty', value: `${user.loyaltyCoins || 0} coins` },
    { icon: '📋', label: 'Ordering flow', value: 'Simple checkout' },
  ];

  return (
    <div className="page-shell shell profile-layout-web">
      <section className="card profile-main-card stack-list">
        <div className="profile-header-web">
          <div className="profile-avatar">👤</div>
          <div>
            <h1>{user.fullName || user.email || 'User'}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>

        <div className="profile-stat-grid">
          <article className="card card--nested stat-card-web">
            <div className="stat-card-web__icon">⭐</div>
            <strong>{user.loyaltyCoins || 0}</strong>
            <span>Coins</span>
          </article>
          <article className="card card--nested stat-card-web">
            <div className="stat-card-web__icon">📦</div>
            <strong>{completedOrders}</strong>
            <span>Delivered orders</span>
          </article>
          <article className="card card--nested stat-card-web">
            <div className="stat-card-web__icon">💰</div>
            <strong>{formatCurrency(totalSpent)}</strong>
            <span>Total spent</span>
          </article>
        </div>

        <section className="card card--nested loyalty-box-web">
          <div className="section-heading section-heading--tight">
            <div>
              <p className="eyebrow">Loyalty program</p>
              <h2>Earn 1 coin per HK$1 spent</h2>
            </div>
          </div>
          <p className="muted">Redeem 100 coins for HK$1 off. Maximum redemption is 50% of the order total.</p>
          <div className="loyalty-progress-web">
            <div className="loyalty-progress-web__bar">
              <div className="loyalty-progress-web__fill" style={{ width: `${Math.min(((user.loyaltyCoins || 0) % 500) / 5, 100)}%` }} />
            </div>
            <div className="muted small-text">{500 - ((user.loyaltyCoins || 0) % 500)} coins to next reward</div>
          </div>
        </section>

        <section className="card card--nested">
          <div className="section-heading section-heading--tight">
            <div>
              <p className="eyebrow">Saved custom meals</p>
              <h2>Quick ways to repeat personalized orders</h2>
            </div>
          </div>
          {!savedPresets.length ? (
            <div className="muted small-text">Save a Build Your Own Bowl preset first. It will appear here for faster repeat ordering.</div>
          ) : (
            <div className="saved-preset-list">
              {savedPresets.map((preset) => (
                <div key={preset.id} className="saved-preset-line">
                  <div>
                    <strong>{preset.title}</strong>
                    <div className="muted small-text">{preset.goal_tag || 'Custom meal'} · {formatCurrency(preset.estimated_price || 0)}</div>
                  </div>
                  <button type="button" className="ghost-btn" onClick={() => onUsePreset?.(preset)}>Use again</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      <aside className="profile-side-column">
        <section className="card">
          <p className="eyebrow">Account</p>
          <div className="menu-list-web">
            {accountItems.map((item) => (
              <div className="menu-line-web" key={item.label}>
                <div><span>{item.icon}</span><strong>{item.label}</strong></div>
                <span className="muted small-text">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card quick-links-card">
          <Link className="ghost-btn quick-link-btn" to="/orders">View orders</Link>
          {user.role === 'admin' && <Link className="ghost-btn quick-link-btn" to="/admin">Restaurant dashboard</Link>}
          <button className="primary-btn quick-link-btn" onClick={signOut}>Sign out</button>
        </section>
      </aside>
    </div>
  );
}
