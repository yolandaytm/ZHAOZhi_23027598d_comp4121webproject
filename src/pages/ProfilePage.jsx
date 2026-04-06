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
  const lastOrder = (orders || [])[0];
  const lastType = lastOrder?.order_type ? String(lastOrder.order_type).replace(/_/g, ' ') : 'No orders yet';

  const quickItems = [
    { icon: '🍱', label: 'Saved meals', value: `${savedPresets.length}` },
    { icon: '⭐', label: 'Coins', value: `${user.loyaltyCoins || 0}` },
    { icon: '📦', label: 'Delivered', value: `${completedOrders}` },
    { icon: '🕒', label: 'Last order type', value: lastType },
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
            <span>Delivered</span>
          </article>
          <article className="card card--nested stat-card-web">
            <div className="stat-card-web__icon">💰</div>
            <strong>{formatCurrency(totalSpent)}</strong>
            <span>Spent</span>
          </article>
        </div>

        <section className="card card--nested loyalty-box-web">
          <div className="section-heading section-heading--tight">
            <div>
              <p className="eyebrow">Loyalty</p>
              <h2>Earn 1 coin per HK$1</h2>
            </div>
          </div>
          <p className="muted">100 coins = HK$1 off.</p>
          <div className="loyalty-progress-web">
            <div className="loyalty-progress-web__bar">
              <div className="loyalty-progress-web__fill" style={{ width: `${Math.min(((user.loyaltyCoins || 0) % 500) / 5, 100)}%` }} />
            </div>
            <div className="muted small-text">{500 - ((user.loyaltyCoins || 0) % 500)} to next reward</div>
          </div>
        </section>

        <section className="card card--nested">
          <div className="section-heading section-heading--tight">
            <div>
              <p className="eyebrow">Saved meals</p>
              <h2>Use again</h2>
            </div>
          </div>
          {!savedPresets.length ? (
            <div className="muted small-text">Save a custom bowl first.</div>
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
            {quickItems.map((item) => (
              <div className="menu-line-web" key={item.label}>
                <div><span>{item.icon}</span><strong>{item.label}</strong></div>
                <span className="muted small-text">{item.value}</span>
              </div>
            ))}
            <Link className="menu-line-web menu-line-web--link" to="/settings"><div><span>⚙️</span><strong>Settings</strong></div><span className="muted small-text">Security · health · support</span></Link>
            <div className="menu-line-web"><div><span>🔐</span><strong>Change password</strong></div><span className="muted small-text">Planned</span></div>
            <div className="menu-line-web"><div><span>🛡️</span><strong>MFA</strong></div><span className="muted small-text">Planned</span></div>
            <div className="menu-line-web"><div><span>💬</span><strong>Contact us</strong></div><span className="muted small-text">Planned</span></div>
          </div>
        </section>

        <section className="card quick-links-card">
          <Link className="ghost-btn quick-link-btn" to="/orders">View orders</Link>
          <Link className="ghost-btn quick-link-btn" to="/settings">Open settings</Link>
          {user.role === 'admin' && <Link className="ghost-btn quick-link-btn" to="/admin">Restaurant dashboard</Link>}
          <button className="primary-btn quick-link-btn" onClick={signOut}>Sign out</button>
        </section>
      </aside>
    </div>
  );
}
