import { Link } from 'react-router-dom';

export default function MerchantLoginPage() {
  return (
    <div className="page-shell shell auth-layout-web">
      <section className="card auth-promo">
        <p className="eyebrow">Merchant</p>
        <h1>For shops handling orders and updating progress.</h1>
        <ul className="auth-promo__list">
          <li>View new orders quickly.</li>
          <li>Update order progress in one place.</li>
          <li>More merchant tools are on the way.</li>
        </ul>
      </section>

      <section className="card auth-card auth-card--desktop">
        <p className="eyebrow">Merchant sign in</p>
        <h2>Store access</h2>
        <p className="muted">Merchant sign in will open here.</p>
        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Work email
            <input type="email" placeholder="shop@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" />
          </label>
          <button className="primary-btn" type="button">Merchant sign in</button>
        </form>
        <div className="alert alert--warning">This page is reserved for merchant access.</div>
        <div className="auth-card__actions">
          <Link className="ghost-btn auth-toggle" to="/auth">Back to customer sign in</Link>
        </div>
      </section>
    </div>
  );
}
