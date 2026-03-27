import { handleOptions, normalizeDateField, requireAdminAuth, supabase } from '../_lib/common.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  if (!requireAdminAuth(req, res)) return;

  try {
    const { data, error } = await supabase
      .from('suscriptores')
      .select('id, telegram_chat_id, nombre, email, telefono, perfil, estado, trial_fin, proximo_cobro, ultimo_pago, frases_enviadas, amigos_invitados, meses_gratis_acumulados, creado_en, created_at')
      .order('creado_en', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ suscriptores: (data || []).map(normalizeDateField) });
  } catch (error) {
    console.error('Error suscriptores:', error);
    return res.status(500).json({ error: error.message });
  }
}
