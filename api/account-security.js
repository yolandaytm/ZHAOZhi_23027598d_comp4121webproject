export default async function handler(_req, res) {
  res.status(501).json({
    ok: false,
    planned: true,
    message: 'Account security API is reserved for later implementation.',
    features: ['change_password', 'mfa', 'trusted_devices', 'login_alerts'],
  });
}
