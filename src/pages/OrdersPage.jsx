import StatusBadge from '../components/StatusBadge.jsx';
import { formatCurrency } from '../lib/pricing.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { formatCustomization, shortOrderId } from '../lib/orderFormatting.js';

export default function OrdersPage({ orders, loading, onRefresh }) {
  const { user } = useAuth();
  const safeOrders = Array.isArray(orders) ? orders : [];

  if (!user) {
    return (
      <div className="page-shell shell narrow-shell">
        <section className="card empty-box">
          <h2>Login required</h2>
          <p>You can browse the menu without login, but order history belongs to your account.</p>
          <Link className="primary-btn" to="/auth">Go to login</Link>
        </section>
      </div>
    );
  }

  const activeOrders = safeOrders.filter((o) => ['received', 'cooking', 'ready', 'out_for_delivery'].includes(o?.status));
  const pastOrders = safeOrders.filter((o) => !['received', 'cooking', 'ready', 'out_for_delivery'].includes(o?.status));

  return (
    <div className="page-shell shell orders-layout-web">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Track your current and past orders</h1>
        </div>
        <button type="button" className="ghost-btn" onClick={onRefresh}>Refresh</button>
      </section>

      {loading && <div className="card empty-box">Loading orders...</div>}
      {!loading && !safeOrders.length && <div className="card empty-box">No orders yet.</div>}

      {!!activeOrders.length && (
        <section className="orders-section-web">
          <h2>Active orders</h2>
          <div className="stack-list">
            {activeOrders.map((order, index) => (
              <OrderArticle order={order} key={order?.id || `active-${index}`} />
            ))}
          </div>
        </section>
      )}

      {!!pastOrders.length && (
        <section className="orders-section-web">
          <h2>Order history</h2>
          <div className="stack-list">
            {pastOrders.map((order, index) => (
              <OrderArticle order={order} key={order?.id || `past-${index}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderArticle({ order }) {
  const items = Array.isArray(order?.order_items) ? order.order_items : [];
  return (
    <article className="card order-web-card">
      <div className="order-web-card__header">
        <div>
          <h3>Order #{shortOrderId(order?.id)}</h3>
          <p className="muted">{formatCreatedAt(order?.created_at)}</p>
        </div>
        <div className="order-web-card__summary">
          <StatusBadge status={order?.status || 'received'} />
          <strong>{formatCurrency(order?.total || 0)}</strong>
        </div>
      </div>

      <div className="order-web-card__meta">
        <div><span>Type</span><strong>{beautify(order?.order_type)}</strong></div>
        <div><span>Slot</span><strong>{formatOrderSlot(order)}</strong></div>
        <div><span>Coins used</span><strong>{Number(order?.coins_redeemed || 0)}</strong></div>
        <div><span>Coins earned</span><strong>{Number(order?.earned_coins || 0)}</strong></div>
      </div>

      {!!order?.notes && (
        <div className="order-web-card__note muted">
          <strong>Order note:</strong> {String(order.notes)}
        </div>
      )}

      <div className="order-web-card__items">
        {!items.length && <div className="muted small-text">No item details available.</div>}
        {items.map((item, index) => {
          const lines = formatCustomization(item?.customization);
          return (
            <div key={item?.id || `${item?.title || 'item'}-${index}`} className="order-item-web">
              <div>
                <strong>{item?.title || 'Meal item'}</strong>
                <div className="muted small-text">Qty {Number(item?.quantity || 1)}</div>
                {lines.map((line) => (
                  <div className="muted small-text" key={line}>{line}</div>
                ))}
              </div>
              <strong>{formatCurrency(item?.line_total || 0)}</strong>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function beautify(value) {
  const map = {
    pickup: 'Pickup',
    delivery: 'Delivery',
    dine_in: 'Dine in',
    out_for_delivery: 'Out for delivery',
  };
  return map[value] || String(value || 'Not set').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatOrderSlot(order) {
  if (order?.scheduled_slot) return String(order.scheduled_slot);
  if (order?.order_type === 'pickup' || order?.order_type === 'delivery') return 'ASAP / no slot chosen';
  if (order?.order_type === 'dine_in') return 'Walk-in / no reservation';
  return 'Not selected';
}

function formatCreatedAt(value) {
  if (!value) return 'Time not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time not available';
  return date.toLocaleString('en-HK');
}
