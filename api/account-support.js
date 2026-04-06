export default async function handler(_req, res) {
  res.status(501).json({
    ok: false,
    planned: true,
    message: 'Support API is reserved for later implementation.',
    features: ['contact_us', 'order_issue', 'feedback'],
  });
}
