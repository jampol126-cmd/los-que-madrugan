import { handleOptions, requireAdminAuth, sendTelegramMessage } from '../_lib/common.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!requireAdminAuth(req, res)) return;

  try {
    const { chat_id, mensaje } = req.body;
    if (!chat_id || !mensaje) return res.status(400).json({ error: 'Se requiere chat_id y mensaje' });

    await sendTelegramMessage(chat_id, `📢 <b>Mensaje del equipo:</b>\n\n${mensaje}`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error enviar-mensaje:', error);
    return res.status(500).json({ error: error.message });
  }
}
