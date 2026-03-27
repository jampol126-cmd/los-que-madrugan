import { handleOptions, requireAdminAuth, sendTelegramMessage, supabase } from '../_lib/common.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!requireAdminAuth(req, res)) return;

  try {
    const { chat_id } = req.body;
    if (!chat_id) return res.status(400).json({ error: 'Se requiere chat_id' });

    const { error } = await supabase
      .from('suscriptores')
      .update({ estado: 'cancelado' })
      .eq('telegram_chat_id', chat_id);

    if (error) throw error;

    await sendTelegramMessage(
      chat_id,
      '❌ Tu suscripción fue cancelada por el administrador. Escribí PAGAR para reactivarla.'
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error cancelar-suscriptor:', error);
    return res.status(500).json({ error: error.message });
  }
}
