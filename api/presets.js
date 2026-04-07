import { allowCors, readJsonBody, sendJson } from '../lib/server/http.js';
import { getServiceClient } from '../lib/server/supabase.js';
import { requireUser } from '../lib/server/auth.js';

function isMissingTable(error) {
  const message = String(error?.message || '');
  return message.includes('custom_meal_presets') && (message.includes('does not exist') || message.includes('relation'));
}

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  try {
    const service = getServiceClient();

    if (req.method === 'GET') {
      const scope = req.query?.scope || 'community';
      let query = service.from('custom_meal_presets').select('*');

      if (scope === 'mine') {
        const auth = await requireUser(req);
        query = query.eq('user_id', auth.user.id);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(scope === 'mine' ? 10 : 6);
      if (error) {
        if (isMissingTable(error)) {
          sendJson(res, 200, { presets: [], setupRequired: true });
          return;
        }
        throw error;
      }

      sendJson(res, 200, { presets: data || [], setupRequired: false });
      return;
    }

    if (req.method === 'POST') {
      const auth = await requireUser(req);
      const body = await readJsonBody(req);
      const title = String(body.title || '').trim();
      const menuItemSlug = String(body.menuItemSlug || '').trim();
      const menuItemId = body.menuItemId || null;
      const customization = body.customization && typeof body.customization === 'object' ? body.customization : {};
      const estimatedPrice = Number(body.estimatedPrice || 0);
      const goalTag = String(body.goalTag || '').trim();
      const isPublic = Boolean(body.isPublic);

      if (!title) throw new Error('Preset title is required');
      if (!menuItemSlug) throw new Error('Missing menu item slug');

      const insertPayload = {
        user_id: auth.user.id,
        menu_item_id: menuItemId,
        menu_item_slug: menuItemSlug,
        title,
        goal_tag: goalTag || null,
        customization,
        estimated_price: Math.max(0, Math.round(estimatedPrice)),
        is_public: isPublic,
      };

      const { data, error } = await service.from('custom_meal_presets').insert(insertPayload).select('*').single();
      if (error) {
        if (isMissingTable(error)) {
          const friendly = new Error('Run supabase/community_presets_patch.sql first to enable saved meals.');
          friendly.status = 400;
          throw friendly;
        }
        throw error;
      }

      sendJson(res, 201, { preset: data });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || 'Unexpected server error' });
  }
}
