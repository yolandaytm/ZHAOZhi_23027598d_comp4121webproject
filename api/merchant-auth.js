import { allowCors, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  return sendJson(res, 501, { error: 'Merchant sign in is being prepared.' });
}
