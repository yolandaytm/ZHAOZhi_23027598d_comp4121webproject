import { useEffect, useMemo, useState } from 'react';
import MenuCard from '../components/MenuCard.jsx';
import AiMealHelper from '../components/AiMealHelper.jsx';
import CommunityPresetCard from '../components/CommunityPresetCard.jsx';
import { apiRequest } from '../lib/api.js';
import { goalOptions, kitchenOptions, matchesGoal, matchesKitchen, matchesMealTime } from '../lib/mealMeta.js';

const mealTimeOptions = [
  { id: 'all', label: 'All day', time: 'Full menu', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', time: '7-11 AM', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', time: '11 AM-2 PM', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', time: '6-9 PM', emoji: '🌆' },
  { id: 'supper', label: 'Supper', time: '9 PM-1 AM', emoji: '🌙' },
];

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
  const [goal, setGoal] = useState('All goals');
  const [kitchen, setKitchen] = useState('All kitchens');

  const categories = useMemo(() => ['All', ...new Set(menuItems.map((item) => item.category).filter(Boolean))], [menuItems]);
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
    return () => { ignore = true; };
  }, []);

  const filtered = useMemo(() => menuItems.filter((item) => {
    if ((item.id || item.slug) === (builderItem?.id || builderItem?.slug)) return false;
    const categoryName = item.category || '';
    const matchCategory = category === 'All' || categoryName === category;
    const keyword = `${item.name} ${item.name_chinese || item.nameChinese || ''} ${item.description || ''} ${item.category || ''} ${kitchen}`.toLowerCase();
    const matchSearch = keyword.includes(search.toLowerCase());
    return matchCategory && matchSearch && matchesMealTime(item, mealTime) && matchesGoal(item, goal) && matchesKitchen(item, kitchen);
  }), [menuItems, builderItem, category, search, mealTime, goal, kitchen]);

  const unavailableCount = (inventoryFlags || []).filter((flag) => flag.is_available === false).length;

  return (
    <div className="page-shell shell desktop-home">
      <section className="desktop-home__hero desktop-home__hero--single">
        <article className="card hero-panel hero-panel--brand">
          <div className="hero-brandline">
            <img src="/original-assets/icon.png" alt="HK Home Dishes" className="hero-brandline__logo" />
            <div>
              <div className="hero-brandline__title">HK Home Dishes</div>
              <div className="muted">Flexible meals for work days and healthy goals</div>
            </div>
          </div>
          <h1>Order fast. Customize when you need to.</h1>
          <p className="muted hero-panel__copy">Pick a regular dish or build your own bowl.</p>

          <div className="hero-search-row hero-search-row--triple">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes or kitchens" />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
            <button type="button" className="ghost-btn" onClick={() => setAiOpen(true)}>Quick suggestion</button>
          </div>

          <div className="filter-grid-web">
            <label>
              <span className="small-text muted">Kitchen</span>
              <select value={kitchen} onChange={(event) => setKitchen(event.target.value)}>
                {kitchenOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
            </label>
            <label>
              <span className="small-text muted">Goal</span>
              <select value={goal} onChange={(event) => setGoal(event.target.value)}>
                {goalOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
            </label>
          </div>

          <div className="meal-presets-card">
            <div className="meal-presets-card__header">
              <div>
                <h3>Order time</h3>
                <p className="muted small-text">Filters the regular dishes below.</p>
              </div>
            </div>
            <div className="meal-presets-grid meal-presets-grid--five">
              {mealTimeOptions.map((meal) => (
                <button type="button" key={meal.id} className={`meal-preset ${mealTime === meal.id ? 'meal-preset--active' : ''}`} onClick={() => setMealTime(meal.id)}>
                  <span className="meal-preset__emoji">{meal.emoji}</span>
                  <strong>{meal.label}</strong>
                  <span>{meal.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-summary-row">
            <div className="hero-summary-pill"><strong>{filtered.length}</strong><span>matching dishes</span></div>
            {unavailableCount > 0 && <div className="hero-summary-pill"><strong>{unavailableCount}</strong><span>unavailable options</span></div>}
          </div>
        </article>
      </section>

      {builderItem && (
        <section className="builder-feature-section">
          <div className="section-heading section-heading--tight">
            <div>
              <p className="eyebrow">Custom meal</p>
              <h2>Build your own bowl</h2>
              <p className="muted small-text">Choose base, protein, sauce, extras, and notes.</p>
            </div>
          </div>
          <div className="builder-feature-layout builder-feature-layout--single">
            <div className="card builder-feature-copy">
              <h3>Build your own bowl</h3>
              <ul className="feature-list-web">
                <li>Useful for office lunch and healthy goals.</li>
                <li>Adjust ingredients and price in one flow.</li>
                <li>Save a good combo and use it again.</li>
              </ul>
              <div className="builder-feature-actions">
                <button type="button" className="primary-btn" onClick={() => onCustomize(builderItem)}>Open builder</button>
                <span className="muted small-text">Always available</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="community-section-web">
        <div className="section-heading section-heading--tight">
          <div>
            <p className="eyebrow">Community meals</p>
            <h2>Saved bowls</h2>
          </div>
        </div>
        {communityPresets.length ? (
          <div className="community-grid-web">
            {communityPresets.map((preset) => (
              <CommunityPresetCard key={preset.id} preset={preset} onUse={(chosenPreset) => builderItem && onCustomize(builderItem, chosenPreset.customization)} />
            ))}
          </div>
        ) : (
          <div className="card empty-box">No saved bowls yet.</div>
        )}
      </section>

      <section className="menu-section-web">
        <div className="section-heading section-heading--tight">
          <div>
            <p className="eyebrow">Regular menu</p>
            <h2>{goal === 'All goals' ? 'Regular dishes' : `${goal} dishes`}</h2>
          </div>
        </div>
        {!filtered.length ? (
          <div className="card empty-box">No dishes match the current filters.</div>
        ) : (
          <div className="menu-grid-desktop">
            {filtered.map((item) => <MenuCard key={item.id || item.slug} item={item} onCustomize={onCustomize} />)}
          </div>
        )}
      </section>

      <AiMealHelper open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
