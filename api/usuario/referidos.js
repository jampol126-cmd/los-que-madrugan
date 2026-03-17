import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  const chatId = req.query.chat_id
  if (!chatId) return res.status(400).json({ error: 'Falta chat_id' })

  const { data: user, error } = await supabase
    .from('suscriptores')
    .select('id, codigo_referido, meses_gratis_acumulados, amigos_invitados')
    .eq('telegram_chat_id', chatId)
    .single()

  if (error || !user) return res.status(404).json({ error: 'Usuario no encontrado' })

  const { data: logs } = await supabase
    .from('referidos_log')
    .select('id, estado, fecha_registro, invitado_id')
    .eq('invitador_id', user.id)
    .order('fecha_registro', { ascending: false })

  const invitadoIds = (logs ?? []).map(l => l.invitado_id)
  let nombres = {}

  if (invitadoIds.length > 0) {
    const { data } = await supabase.from('suscriptores').select('id, nombre').in('id', invitadoIds)
    nombres = Object.fromEntries((data ?? []).map(i => [i.id, i.nombre]))
  }

  return res.json({
    codigo_referido: user.codigo_referido,
    meses_gratis_acumulados: user.meses_gratis_acumulados,
    amigos_invitados: user.amigos_invitados,
    referidos: (logs ?? []).map(l => ({
      id: l.id,
      nombre: nombres[l.invitado_id] ?? null,
      estado: l.estado,
      fecha_registro: l.fecha_registro,
    })),
  })
}
