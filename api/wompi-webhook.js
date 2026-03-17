import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const body = req.body
  // Wompi puede mandar { data: { transaction } } o { transaction } según la versión
  const transaction = body.data?.transaction ?? body.transaction

  if (!transaction) return res.json({ ok: true })

  // reference formato: LQM_chatId_timestamp
  const chatId = transaction.reference?.split('_')[1]
  if (!chatId) return res.status(400).json({ error: 'No chatId' })

  switch (transaction.status) {
    case 'APPROVED': {
      const proximoCobro = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const { data: user } = await supabase
        .from('suscriptores')
        .update({
          estado: 'activo',
          email: transaction.customer_email,
          telefono: transaction.customer_phone_number,
          wompi_token: transaction.payment_method?.token,
          proximo_cobro: proximoCobro,
          ultimo_pago: new Date().toISOString(),
        })
        .eq('telegram_chat_id', chatId)
        .select('id, referido_por, nombre, amigos_invitados')
        .single()

      if (user?.referido_por) {
        const { data: invitador } = await supabase
          .from('suscriptores')
          .select('id, telegram_chat_id, meses_gratis_acumulados, amigos_invitados')
          .eq('codigo_referido', user.referido_por)
          .single()

        if (invitador) {
          await supabase
            .from('suscriptores')
            .update({
              meses_gratis_acumulados: invitador.meses_gratis_acumulados + 1,
              amigos_invitados: (invitador.amigos_invitados || 0) + 1,
            })
            .eq('id', invitador.id)

          await supabase
            .from('referidos_log')
            .update({ estado: 'pago_confirmado', recompensa_aplicada: true, meses_otorgados: 1 })
            .eq('invitado_id', user.id)

          await sendTelegramMessage(
            invitador.telegram_chat_id,
            `🎉 ¡Ganaste 1 mes gratis! ${user.nombre} pagó.`
          )
        }
      }

      await sendTelegramMessage(
        chatId,
        `🎉 ¡Bienvenido al club! Tu pago fue confirmado.\n\nMañana 6AM tu primera frase. Escribí REFERIDOS para invitar amigos y ganar meses gratis.`
      )
      break
    }
    case 'DECLINED':
      await sendTelegramMessage(chatId, `❌ Pago rechazado. Probá con otro método escribiendo PAGAR.`)
      break
    case 'PENDING':
      await sendTelegramMessage(chatId, `⏳ Pago en proceso. Te aviso cuando se confirme (5-10 min).`)
      break
    case 'ERROR':
      await sendTelegramMessage(chatId, `⚠️ Error técnico. No se cobró. Intentá de nuevo: PAGAR`)
      break
  }

  return res.json({ received: true, status: transaction.status })
}
