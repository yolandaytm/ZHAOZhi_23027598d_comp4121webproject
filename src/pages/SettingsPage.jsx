import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const defaultDraft = {
  defaultDestination: 'Office',
  building: '',
  floor: '',
  deskNote: '',
  lunchReminder: true,
  defaultSlot: 'ASAP',
  goal: 'Balanced',
  calorieTarget: '650',
  proteinTarget: '35',
  allergies: '',
  avoidIngredients: '',
  supportChannel: 'Email',
  supportEmail: '',
  supportPhone: '',
  savedKitchens: 'HK Home Dishes, Fit Bowl Lab',
  teamLunch: false,
  receiptNeeded: false,
  contactlessDropoff: false,
  mfaPlanned: true,
};

function SectionHeader({ eyebrow, title, note }) {
  return (
    <div className="section-heading section-heading--tight settings-section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {note && <p className="muted small-text">{note}</p>}
      </div>
    </div>
  );
}

function SecurityTile({ title, detail, action }) {
  return (
    <div className="settings-tile">
      <div>
        <strong>{title}</strong>
        <div className="muted small-text">{detail}</div>
      </div>
      <button type="button" className="ghost-btn" disabled>{action}</button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState(defaultDraft);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dishy-settings-draft');
      if (raw) setDraft((current) => ({ ...current, ...JSON.parse(raw) }));
    } catch {
      // ignore broken local draft
    }
  }, []);

  function patch(name, value) {
    setSaved(false);
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function saveDraft() {
    localStorage.setItem('dishy-settings-draft', JSON.stringify(draft));
    setSaved(true);
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="page-shell shell settings-layout-web">
      <section className="card settings-main-card stack-list">
        <div className="settings-page-top">
          <div>
            <p className="eyebrow">Account</p>
            <h1>Settings</h1>
            <p className="muted">Keep your workday ordering, health goals, and support details in one place.</p>
          </div>
          <div className="settings-page-actions">
            <button type="button" className="ghost-btn" onClick={saveDraft}>Save draft</button>
            {saved && <span className="muted small-text">Saved locally</span>}
          </div>
        </div>

        <section className="card card--nested">
          <SectionHeader eyebrow="Security" title="Sign-in and protection" note="UI ready. API can be added later." />
          <div className="settings-grid-two">
            <SecurityTile title="Change password" detail="Use email + password today. Password update endpoint can be wired later." action="Planned" />
            <SecurityTile title="MFA" detail="Reserve a spot for authenticator / SMS setup when you are ready." action="Planned" />
            <SecurityTile title="Trusted devices" detail="Show active sessions and allow sign-out from other devices later." action="Planned" />
            <SecurityTile title="Login alerts" detail="Email alerts for new device sign-ins can be added later." action="Planned" />
          </div>
        </section>

        <section className="card card--nested">
          <SectionHeader eyebrow="Workday" title="Delivery and office setup" note="Useful for office lunch and repeat ordering." />
          <div className="settings-grid-two">
            <label>
              <span>Default destination</span>
              <select value={draft.defaultDestination} onChange={(e) => patch('defaultDestination', e.target.value)}>
                <option>Office</option>
                <option>Home</option>
                <option>Gym</option>
              </select>
            </label>
            <label>
              <span>Default slot</span>
              <select value={draft.defaultSlot} onChange={(e) => patch('defaultSlot', e.target.value)}>
                <option>ASAP</option>
                <option>11:30 - 12:00</option>
                <option>12:00 - 12:30</option>
                <option>12:30 - 13:00</option>
              </select>
            </label>
            <label>
              <span>Company / building</span>
              <input value={draft.building} onChange={(e) => patch('building', e.target.value)} placeholder="Office Tower / Company" />
            </label>
            <label>
              <span>Floor / desk note</span>
              <input value={draft.floor} onChange={(e) => patch('floor', e.target.value)} placeholder="22/F or reception note" />
            </label>
            <label className="settings-full-width">
              <span>Drop-off note</span>
              <input value={draft.deskNote} onChange={(e) => patch('deskNote', e.target.value)} placeholder="Call on arrival / leave at reception" />
            </label>
            <label className="checkbox-row settings-full-width">
              <input type="checkbox" checked={draft.lunchReminder} onChange={(e) => patch('lunchReminder', e.target.checked)} />
              <span>Lunch reminder</span>
            </label>
          </div>
        </section>

        <section className="card card--nested">
          <SectionHeader eyebrow="Health" title="Meal targets" note="Keep goals visible when you build or reorder meals." />
          <div className="settings-grid-two">
            <label>
              <span>Main goal</span>
              <select value={draft.goal} onChange={(e) => patch('goal', e.target.value)}>
                <option>Balanced</option>
                <option>High protein</option>
                <option>Lighter meals</option>
                <option>Low carb</option>
                <option>Office lunch</option>
              </select>
            </label>
            <label>
              <span>Target kcal / meal</span>
              <input value={draft.calorieTarget} onChange={(e) => patch('calorieTarget', e.target.value)} placeholder="650" />
            </label>
            <label>
              <span>Target protein / meal (g)</span>
              <input value={draft.proteinTarget} onChange={(e) => patch('proteinTarget', e.target.value)} placeholder="35" />
            </label>
            <label>
              <span>Avoid ingredients</span>
              <input value={draft.avoidIngredients} onChange={(e) => patch('avoidIngredients', e.target.value)} placeholder="Mushroom, onion" />
            </label>
            <label className="settings-full-width">
              <span>Allergies / strict rules</span>
              <textarea className="textarea" rows="3" value={draft.allergies} onChange={(e) => patch('allergies', e.target.value)} placeholder="Nut allergy, no shellfish..." />
            </label>
          </div>
        </section>

        <section className="card card--nested">
          <SectionHeader eyebrow="Support" title="Contact and help" note="Front-end ready. API placeholder routes included." />
          <div className="settings-grid-two">
            <label>
              <span>Preferred channel</span>
              <select value={draft.supportChannel} onChange={(e) => patch('supportChannel', e.target.value)}>
                <option>Email</option>
                <option>Phone</option>
                <option>WhatsApp</option>
              </select>
            </label>
            <label>
              <span>Support email</span>
              <input value={draft.supportEmail} onChange={(e) => patch('supportEmail', e.target.value)} placeholder="you@example.com" />
            </label>
            <label>
              <span>Support phone</span>
              <input value={draft.supportPhone} onChange={(e) => patch('supportPhone', e.target.value)} placeholder="Optional" />
            </label>
            <div className="settings-tile settings-tile--action">
              <div>
                <strong>Contact us</strong>
                <div className="muted small-text">Reserve a clear spot for order issues and support requests.</div>
              </div>
              <button type="button" className="ghost-btn" disabled>Planned</button>
            </div>
          </div>
        </section>

        <section className="card card--nested">
          <SectionHeader eyebrow="Ordering" title="Advanced tools" note="Useful placeholders for later work." />
          <div className="settings-grid-two">
            <label>
              <span>Saved kitchens</span>
              <input value={draft.savedKitchens} onChange={(e) => patch('savedKitchens', e.target.value)} placeholder="HK Home Dishes" />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={draft.teamLunch} onChange={(e) => patch('teamLunch', e.target.checked)} />
              <span>Team lunch mode</span>
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={draft.receiptNeeded} onChange={(e) => patch('receiptNeeded', e.target.checked)} />
              <span>Receipt reminder</span>
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={draft.contactlessDropoff} onChange={(e) => patch('contactlessDropoff', e.target.checked)} />
              <span>Contactless drop-off</span>
            </label>
          </div>
        </section>
      </section>

      <aside className="settings-side-column">
        <section className="card">
          <p className="eyebrow">Links</p>
          <div className="menu-list-web">
            <Link className="menu-line-web menu-line-web--link" to="/profile"><div><strong>Back to profile</strong></div><span className="muted small-text">Profile</span></Link>
            <Link className="menu-line-web menu-line-web--link" to="/orders"><div><strong>Orders</strong></div><span className="muted small-text">History</span></Link>
            {user.role === 'admin' && <Link className="menu-line-web menu-line-web--link" to="/admin"><div><strong>Restaurant</strong></div><span className="muted small-text">Queue</span></Link>}
          </div>
        </section>

        <section className="card">
          <p className="eyebrow">Ready later</p>
          <div className="menu-list-web">
            <div className="menu-line-web"><div><strong>Change password</strong></div><span className="muted small-text">Stub API</span></div>
            <div className="menu-line-web"><div><strong>MFA</strong></div><span className="muted small-text">Stub API</span></div>
            <div className="menu-line-web"><div><strong>Contact us</strong></div><span className="muted small-text">Stub API</span></div>
            <div className="menu-line-web"><div><strong>Saved addresses</strong></div><span className="muted small-text">UI ready</span></div>
          </div>
        </section>
      </aside>
    </div>
  );
}
