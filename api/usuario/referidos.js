import { handleOptions, supabase } from '../_lib/common.js';

export default async function handler(req, res) {
  if (handleOptions(req, res, 'GET, OPTIONS')) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { chat_id: chatId } = req.query;
    if (!chatId) return res.status(400).json({ error: 'Falta chat_id' });

    const { data: user, error } = await supabase
      .from('suscriptores')
      .select('id, codigo_referido, meses_gratis_acumulados, amigos_invitados')
      .eq('telegram_chat_id', chatId)
      .single();

    if (error || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { data: logs, error: logsError } = await supabase
      .from('referidos_log')
      .select('id, estado, creado_en, invitado_id')
      .eq('invitador_id', user.id)
      .order('creado_en', { ascending: false });

    if (logsError) throw logsError;

    const invitadoIds = (logs || []).map((log) => log.invitado_id).filter(Boolean);
    let nombres = {};

    if (invitadoIds.length > 0) {
      const { data: invitados, error: invitadosError } = await supabase
        .from('suscriptores')
        .select('id, nombre')
        .in('id', invitadoIds);

      if (invitadosError) throw invitadosError;
      nombres = Object.fromEntries((invitados || []).map((item) => [item.id, item.nombre]));
    }

    return res.status(200).json({
      codigo_referido: user.codigo_referido,
      meses_gratis_acumulados: user.meses_gratis_acumulados || 0,
      amigos_invitados: user.amigos_invitados || 0,
      referidos: (logs || []).map((log) => ({
        id: log.id,
        nombre: nombres[log.invitado_id] || null,
        estado: log.estado,
        fecha_registro: log.creado_en,
      })),
    });
  } catch (error) {
    console.error('Error usuario/referidos:', error);
    return res.status(500).json({ error: error.message });
  }
}
