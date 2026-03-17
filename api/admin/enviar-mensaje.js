export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers['authorization'] !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'No auth' })
  }

  const { chat_id, mensaje } = req.body
  if (!chat_id || !mensaje) return res.status(400).json({ error: 'Falta chat_id o mensaje' })

  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      text: `📢 <b>Mensaje del equipo:</b>\n\n${mensaje}`,
      parse_mode: 'HTML',
    }),
  })

  if (!r.ok) return res.status(500).json({ error: 'No se pudo enviar' })
  return res.json({ ok: true })
}
