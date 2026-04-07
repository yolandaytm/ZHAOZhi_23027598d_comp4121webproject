import { allowCors, sendJson } from '../lib/server/http.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  return sendJson(res, 501, { error: 'Security tools are being prepared.' });
}
