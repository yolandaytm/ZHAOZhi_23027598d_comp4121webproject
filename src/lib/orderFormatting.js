import { seasoningAddons } from './mealMeta.js';

const addonLabelMap = Object.fromEntries((seasoningAddons || []).map((item) => [item.code, item.label]));

export function formatCustomization(customization) {
  if (!customization || typeof customization !== 'object') return [];
  const lines = [];
  const single = isPlainObject(customization.singleChoice) ? customization.singleChoice : {};
  const multi = isPlainObject(customization.multiChoice) ? customization.multiChoice : {};
  const optionQuantities = isPlainObject(customization.optionQuantities) ? customization.optionQuantities : {};
  const addonQuantities = isPlainObject(customization.addonQuantities) ? customization.addonQuantities : {};

  for (const [key, value] of Object.entries(single)) {
    if (!value) continue;
    lines.push(`${toLabel(key)}: ${toLabel(value)}`);
  }

  for (const [key, values] of Object.entries(multi)) {
    if (!Array.isArray(values) || !values.length) continue;
    lines.push(`${toLabel(key)}: ${values.map((value) => {
      const qty = Math.max(1, Number(optionQuantities[value] || 1));
      return qty > 1 ? `${toLabel(value)} x${qty}` : toLabel(value);
    }).join(', ')}`);
  }

  const addonEntries = Object.entries(addonQuantities).filter(([, qty]) => Number(qty) > 0);
  if (addonEntries.length) {
    lines.push(`Seasoning: ${addonEntries.map(([code, qty]) => `${addonLabelMap[code] || toLabel(code)} x${qty}`).join(', ')}`);
  }

  if (customization.notes) lines.push(`Meal note: ${String(customization.notes)}`);
  return lines;
}

export function shortOrderId(id) {
  if (!id) return '------';
  return String(id).slice(-6).toUpperCase();
}

function toLabel(value) {
  if (value == null) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}
