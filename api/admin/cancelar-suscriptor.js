import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sendTelegramMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers['authorization'] !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'No auth' })
  }

  const { chat_id } = req.body
  if (!chat_id) return res.status(400).json({ error: 'Falta chat_id' })

  const { error } = await supabase
    .from('suscriptores')
    .update({ estado: 'cancelado' })
    .eq('telegram_chat_id', chat_id)

  if (error) return res.status(500).json({ error: error.message })

  await sendTelegramMessage(chat_id, '❌ Tu suscripción fue cancelada por el administrador. Escribí PAGAR para reactivar.')
  return res.json({ ok: true })
}
