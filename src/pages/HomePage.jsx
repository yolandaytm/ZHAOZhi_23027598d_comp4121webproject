import { useEffect, useMemo, useState } from 'react';
import MenuCard from '../components/MenuCard.jsx';
import AiMealHelper from '../components/AiMealHelper.jsx';
import CommunityPresetCard from '../components/CommunityPresetCard.jsx';
import { apiRequest } from '../lib/api.js';

const mealTimeOptions = [
  { id: 'all', label: 'All day', time: 'Full menu', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', time: '7-11 AM', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', time: '11 AM-2 PM', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', time: '6-9 PM', emoji: '🌆' },
  { id: 'supper', label: 'Supper', time: '9 PM-1 AM', emoji: '🌙' },
];

const mealTimeCategories = {
  all: null,
  breakfast: new Set(['Congee', 'Drinks']),
  lunch: new Set(['Rice Plates', 'Noodles', 'Drinks', 'Signature Builder']),
  dinner: new Set(['Rice Plates', 'Noodles', 'Drinks', 'Signature Builder']),
  supper: new Set(['Congee', 'Noodles', 'Drinks']),
};

function detectDefaultMealTime() {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 18 && hour < 21) return 'dinner';
  if (hour >= 21 || hour < 1) return 'supper';
  return 'all';
}

export default function HomePage({ menuItems, inventoryFlags, onCustomize }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [mealTime, setMealTime] = useState(detectDefaultMealTime());
  const [aiOpen, setAiOpen] = useState(false);
  const [communityPresets, setCommunityPresets] = useState([]);

  const categories = useMemo(() => ['All', ...new Set(menuItems.map((item) => item.category).filter(Boolean))], [menuItems]);
  const availableCategories = mealTimeCategories[mealTime];
  const builderItem = useMemo(() => menuItems.find((item) => item.slug === 'build-your-own-bowl' || item.id === 'build-your-own-bowl'), [menuItems]);

  useEffect(() => {
    let ignore = false;
    async function loadPresets() {
      try {
        const data = await apiRequest('/api/presets');
        if (!ignore) setCommunityPresets(data.presets || []);
      } catch {
        if (!ignore) setCommunityPresets([]);
      }
    }
    loadPresets();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      menuItems.filter((item) => {
        const categoryName = item.category || '';
        const matchCategory = category === 'All' || categoryName === category;
        const matchMealTime = !availableCategories || availableCategories.has(categoryName);
        const keyword = `${item.name} ${item.name_chinese || item.nameChinese || ''} ${item.description || ''}`.toLowerCase();
        const matchSearch = keyword.includes(search.toLowerCase());
        return matchCategory && matchSearch && matchMealTime;
      }),
    [menuItems, category, search, availableCategories]
  );

  const builderVisible = filtered.find((item) => item.id === builderItem?.id);
  const regularItems = filtered.filter((item) => item.id !== builderItem?.id);
  const unavailableCount = (inventoryFlags || []).filter((flag) => flag.is_available === false).length;

  return (
    <div className="page-shell shell desktop-home">
      <section className="desktop-home__hero desktop-home__hero--single">
        <article className="card hero-panel hero-panel--brand">
          <div className="hero-brandline">
            <img src="/original-assets/icon.png" alt="HK Home Dishes" className="hero-brandline__logo" />
            <div>
              <div className="hero-brandline__title">HK Home Dishes</div>
              <div className="muted">家常風味</div>
            </div>
          </div>
          <h1>Choose a dish, customize it, and order online.</h1>
          <p className="muted hero-panel__copy">
            Browse the menu, adjust ingredients when needed, and track your order in one place.
          </p>

          <div className="hero-search-row">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes" />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
          </div>

          <div className="meal-presets-card">
            <div className="meal-presets-card__header">
              <div>
                <h3>Order time</h3>
                <p className="muted small-text">Use the time filter to narrow down relevant dishes.</p>
              </div>
              <button type="button" className="ghost-btn" onClick={() => setAiOpen(true)}>Ask AI for a suggestion</button>
            </div>
            <div className="meal-presets-grid meal-presets-grid--five">
              {mealTimeOptions.map((meal) => (
                <button
                  type="button"
                  key={meal.id}
                  className={`meal-preset ${mealTime === meal.id ? 'meal-preset--active' : ''}`}
                  onClick={() => setMealTime(meal.id)}
                >
                  <span className="meal-preset__emoji">{meal.emoji}</span>
                  <strong>{meal.label}</strong>
                  <span>{meal.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-summary-row">
            <div className="hero-summary-pill"><strong>{filtered.length}</strong><span>matching dishes</span></div>
            {unavailableCount > 0 && <div className="hero-summary-pill"><strong>{unavailableCount}</strong><span>temporarily unavailable options</span></div>}
          </div>
        </article>
      </section>

      {builderVisible && (
        <section className="builder-feature-section">
          <div className="section-heading section-heading--tight">
            <div>
              <p className="eyebrow">Custom meal</p>
              <h2>Build your own meal</h2>
              <p className="muted small-text">This is the clearest part of the business model. Users do not need to order only fixed sets.</p>
            </div>
          </div>
          <div className="builder-feature-layout">
            <div className="card builder-feature-copy">
              <h3>Build Your Own Bowl</h3>
              <p className="muted">Choose base, protein, sauce, spice, extras, and kitchen notes in one flow.</p>
              <ul className="feature-list-web">
                <li>Mix your own combination instead of ordering a fixed set.</li>
                <li>Adjust ingredients and extras to fit your taste or budget.</li>
                <li>Save the meal as a preset and reuse it later.</li>
              </ul>
              <button type="button" className="primary-btn" onClick={() => onCustomize(builderVisible)}>Build your meal</button>
            </div>
            <MenuCard item={builderVisible} onCustomize={onCustomize} />
          </div>
        </section>
      )}

      <section className="community-section-web">
        <div className="section-heading section-heading--tight">
          <div>
            <p className="eyebrow">Community custom meals</p>
            <h2>Reusable bowls built by users</h2>
            <p className="muted small-text">This makes customization more visible and helps repeat use instead of starting from zero each time.</p>
          </div>
        </div>
        {communityPresets.length ? (
          <div className="community-grid-web">
            {communityPresets.map((preset) => (
              <CommunityPresetCard
                key={preset.id}
                preset={preset}
                onUse={(chosenPreset) => builderItem && onCustomize(builderItem, chosenPreset.customization)}
              />
            ))}
          </div>
        ) : (
          <div className="card empty-box">No community meals yet. Save a custom bowl to make this section useful.</div>
        )}
      </section>

      <section className="menu-section-web">
        <div className="section-heading section-heading--tight">
          <div>
            <p className="eyebrow">Regular menu</p>
            <h2>{category === 'All' ? 'Available dishes' : category}</h2>
            <p className="muted small-text">
              {mealTime === 'all' ? 'Showing the full menu.' : `Showing dishes suitable for ${mealTime}.`}
            </p>
          </div>
        </div>
        {!regularItems.length ? (
          <div className="card empty-box">No regular dishes match your search or selected time.</div>
        ) : (
          <div className="menu-grid-desktop">
            {regularItems.map((item) => (
              <MenuCard key={item.id || item.slug} item={item} onCustomize={onCustomize} />
            ))}
          </div>
        )}
      </section>

      <AiMealHelper open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
