import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: Request) {
  const body = await req.json()
  const transaction = body.data?.transaction ?? body.transaction

  if (!transaction) return NextResponse.json({ ok: true })

  // reference formato: LQM_chatId_timestamp
  const chatId = transaction.reference?.split('_')[1]
  if (!chatId) return NextResponse.json({ error: 'No chatId' }, { status: 400 })

  switch (transaction.status) {
    case 'APPROVED': {
      const proximoCobro = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

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
        .select('id, referido_por, nombre')
        .single()

      // Procesar referido si aplica
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
              amigos_invitados: invitador.amigos_invitados + 1,
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

  return NextResponse.json({ received: true, status: transaction.status })
}
