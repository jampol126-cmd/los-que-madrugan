import { handleOptions, requireAdminAuth, sendTelegramMessage, supabase } from '../_lib/common.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!requireAdminAuth(req, res)) return;

  try {
    const { chat_id } = req.body;
    if (!chat_id) return res.status(400).json({ error: 'Se requiere chat_id' });

    const { data: user, error: userError } = await supabase
      .from('suscriptores')
      .select('meses_gratis_acumulados')
      .eq('telegram_chat_id', chat_id)
      .single();

    if (userError || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nuevosMeses = (user.meses_gratis_acumulados || 0) + 1;
    const { error } = await supabase
      .from('suscriptores')
      .update({ meses_gratis_acumulados: nuevosMeses })
      .eq('telegram_chat_id', chat_id);

    if (error) throw error;

    await sendTelegramMessage(
      chat_id,
      `🎁 El equipo de Los que Madrugan te regaló 1 mes gratis. Tenés ${nuevosMeses} mes(es) acumulados.`
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error dar-mes-gratis:', error);
    return res.status(500).json({ error: error.message });
  }
}
