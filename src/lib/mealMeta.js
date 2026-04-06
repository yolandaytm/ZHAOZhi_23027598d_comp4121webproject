export const dishMeta = {
  'soy-chicken-rice': {
    kitchen: 'HK Home Dishes',
    goals: ['Balanced', 'Office lunch'],
    mealTimes: ['lunch', 'dinner'],
    nutrition: { calories: 640, protein: 38, carbs: 62, fat: 18 },
  },
  'char-siu-rice': {
    kitchen: 'HK Home Dishes',
    goals: ['Comfort', 'Office lunch'],
    mealTimes: ['lunch', 'dinner'],
    nutrition: { calories: 710, protein: 32, carbs: 66, fat: 24 },
  },
  'beef-brisket-noodle': {
    kitchen: 'Central Noodle House',
    goals: ['Comfort', 'Dinner'],
    mealTimes: ['lunch', 'dinner', 'supper'],
    nutrition: { calories: 760, protein: 34, carbs: 72, fat: 26 },
  },
  'wonton-noodle-soup': {
    kitchen: 'Central Noodle House',
    goals: ['Lighter meals', 'Office lunch'],
    mealTimes: ['lunch', 'dinner', 'supper'],
    nutrition: { calories: 520, protein: 26, carbs: 54, fat: 14 },
  },
  'century-egg-congee': {
    kitchen: 'Morning Kitchen',
    goals: ['Lighter meals', 'Breakfast'],
    mealTimes: ['breakfast', 'supper'],
    nutrition: { calories: 390, protein: 22, carbs: 48, fat: 10 },
  },
  'milk-tea': {
    kitchen: 'Morning Kitchen',
    goals: ['Comfort', 'Breakfast'],
    mealTimes: ['breakfast', 'lunch', 'dinner', 'supper'],
    nutrition: { calories: 210, protein: 4, carbs: 24, fat: 10 },
  },
  'build-your-own-bowl': {
    kitchen: 'Fit Bowl Lab',
    goals: ['High protein', 'Lighter meals', 'Office lunch'],
    mealTimes: ['breakfast', 'lunch', 'dinner', 'supper'],
    nutrition: { calories: 430, protein: 28, carbs: 38, fat: 12 },
  },
};

export const goalOptions = ['All goals', 'High protein', 'Lighter meals', 'Office lunch', 'Comfort', 'Balanced'];
export const kitchenOptions = ['All kitchens', 'HK Home Dishes', 'Morning Kitchen', 'Central Noodle House', 'Fit Bowl Lab'];

const optionNutrition = {
  'rice-base': { calories: 240, protein: 4, carbs: 53, fat: 1 },
  'noodle-base': { calories: 210, protein: 7, carbs: 42, fat: 3 },
  'salad-base': { calories: 60, protein: 3, carbs: 8, fat: 2 },
  'chicken-protein': { calories: 180, protein: 28, carbs: 0, fat: 7 },
  'beef-protein': { calories: 220, protein: 24, carbs: 0, fat: 14 },
  'tofu-protein': { calories: 140, protein: 13, carbs: 4, fat: 9 },
  'soy-garlic': { calories: 35, protein: 1, carbs: 6, fat: 1 },
  'sesame': { calories: 70, protein: 1, carbs: 4, fat: 6 },
  'ginger-scallion': { calories: 45, protein: 1, carbs: 3, fat: 3 },
  'none': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  mild: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  hot: { calories: 2, protein: 0, carbs: 0, fat: 0 },
  'fried-egg': { calories: 90, protein: 6, carbs: 1, fat: 7 },
  'bok-choy': { calories: 25, protein: 2, carbs: 4, fat: 0 },
  'tofu-skin': { calories: 80, protein: 7, carbs: 3, fat: 4 },
  broccoli: { calories: 30, protein: 3, carbs: 5, fat: 0 },
  mushroom: { calories: 20, protein: 2, carbs: 3, fat: 0 },
};

export function getDishMeta(item) {
  const key = item?.slug || item?.id || '';
  return dishMeta[key] || {
    kitchen: 'HK Home Dishes',
    goals: ['Balanced'],
    mealTimes: ['breakfast', 'lunch', 'dinner', 'supper'],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };
}

export function matchesGoal(item, selectedGoal) {
  if (!selectedGoal || selectedGoal === 'All goals') return true;
  return getDishMeta(item).goals.includes(selectedGoal);
}

export function matchesKitchen(item, selectedKitchen) {
  if (!selectedKitchen || selectedKitchen === 'All kitchens') return true;
  return getDishMeta(item).kitchen === selectedKitchen;
}

export function matchesMealTime(item, mealTime) {
  if (!mealTime || mealTime === 'all') return true;
  return getDishMeta(item).mealTimes.includes(mealTime);
}

export function getNutritionSummary(item) {
  return getDishMeta(item).nutrition;
}

export function formatNutritionLine(nutrition) {
  return `${nutrition.calories} kcal · ${nutrition.protein}g protein`;
}

export function estimateCustomizationNutrition(item, customization) {
  if (!item) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const base = { ...getDishMeta(item).nutrition };
  const schema = item.customization_schema || item.customizationSchema || {};

  for (const group of schema.singleChoice || []) {
    const selected = customization?.singleChoice?.[group.key];
    const add = optionNutrition[selected] || null;
    if (add) {
      base.calories += add.calories;
      base.protein += add.protein;
      base.carbs += add.carbs;
      base.fat += add.fat;
    }
  }

  for (const group of schema.multiChoice || []) {
    const selected = customization?.multiChoice?.[group.key] || [];
    for (const code of selected) {
      const add = optionNutrition[code] || null;
      if (add) {
        base.calories += add.calories;
        base.protein += add.protein;
        base.carbs += add.carbs;
        base.fat += add.fat;
      }
    }
  }

  return base;
}

export function applyBuilderPreset(presetKey, currentCustomization) {
  const next = structuredClone(currentCustomization || { singleChoice: {}, multiChoice: {}, notes: '' });
  if (presetKey === 'Office lunch') {
    next.singleChoice.base = 'rice-base';
    next.singleChoice.protein = 'chicken-protein';
    next.singleChoice.sauce = 'ginger-scallion';
    next.singleChoice.spice = 'none';
    next.multiChoice.sides = ['broccoli'];
  } else if (presetKey === 'High protein') {
    next.singleChoice.base = 'salad-base';
    next.singleChoice.protein = 'chicken-protein';
    next.singleChoice.sauce = 'soy-garlic';
    next.singleChoice.spice = 'mild';
    next.multiChoice.sides = ['fried-egg', 'broccoli'];
  } else if (presetKey === 'Lighter') {
    next.singleChoice.base = 'salad-base';
    next.singleChoice.protein = 'tofu-protein';
    next.singleChoice.sauce = 'none';
    next.singleChoice.spice = 'none';
    next.multiChoice.sides = ['broccoli'];
  }
  return next;
}
