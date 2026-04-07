import { allowCors, readJsonBody, sendJson } from '../lib/server/http.js';
import { requireUser } from '../lib/server/auth.js';
import { getServiceClient } from '../lib/server/supabase.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const auth = await requireUser(req);
    const body = await readJsonBody(req);
    if (!process.env.ADMIN_SEED_SECRET || body.secret !== process.env.ADMIN_SEED_SECRET) {
      return sendJson(res, 403, { error: 'Invalid bootstrap secret' });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('user_id', auth.user.id)
      .select('*')
      .single();

    if (error) throw error;
    return sendJson(res, 200, { profile: data });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message || 'Bootstrap failed' });
  }
}
