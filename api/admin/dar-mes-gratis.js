import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers['authorization'] !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'No auth' })
  }

  const { chat_id } = req.body
  if (!chat_id) return res.status(400).json({ error: 'Falta chat_id' })

  const { data: user, error } = await supabase
    .from('suscriptores')
    .select('meses_gratis_acumulados')
    .eq('telegram_chat_id', chat_id)
    .single()

  if (error || !user) return res.status(404).json({ error: 'Usuario no encontrado' })

  await supabase
    .from('suscriptores')
    .update({ meses_gratis_acumulados: user.meses_gratis_acumulados + 1 })
    .eq('telegram_chat_id', chat_id)

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      text: `🎁 El equipo de Los que Madrugan te regaló 1 mes gratis. Tenés ${user.meses_gratis_acumulados + 1} mes(es) acumulados.`,
    }),
  })

  return res.json({ ok: true })
}
