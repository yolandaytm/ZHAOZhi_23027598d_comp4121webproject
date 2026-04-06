export default async function handler(_req, res) {
  res.status(501).json({
    ok: false,
    planned: true,
    message: 'Account preferences API is reserved for later implementation.',
    features: ['delivery_defaults', 'meal_goals', 'saved_kitchens', 'lunch_reminders'],
  });
}
