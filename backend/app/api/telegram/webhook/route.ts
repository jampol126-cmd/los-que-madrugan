import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'
import { generarCodigoReferido } from '@/lib/frases'

export async function POST(req: Request) {
  const body = await req.json()
  const message = body.message?.text
  const chatId = body.message?.chat?.id?.toString()
  const name = body.message?.chat?.first_name || 'madrugador'

  if (!chatId) return NextResponse.json({ ok: true })

  // COMANDO /start
  if (message?.startsWith('/start')) {
    const refCode = message.split(' ')[1]?.replace('REF_', '') || null

    const { data: existing } = await supabase
      .from('suscriptores')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single()

    if (!existing) {
      const codigo = generarCodigoReferido(name)

      const { data: newUser } = await supabase
        .from('suscriptores')
        .insert({
          telegram_chat_id: chatId,
          nombre: name,
          estado: 'prospecto',
          codigo_referido: codigo,
          referido_por: refCode || null,
        })
        .select()
        .single()

      if (refCode && newUser) {
        const { data: invitador } = await supabase
          .from('suscriptores')
          .select('id, telegram_chat_id')
          .eq('codigo_referido', refCode)
          .single()

        if (invitador) {
          await supabase.from('referidos_log').insert({
            invitador_id: invitador.id,
            invitado_id: newUser.id,
            estado: 'registrado',
          })
          await sendTelegramMessage(
            invitador.telegram_chat_id,
            `🎉 ¡Alguien usó tu link!\n\n${name} se unió. Si paga, ambos ganan 1 mes gratis.`
          )
        }
      }
    }

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🌅 <b>Bienvenido a Los que Madrugan</b>\n\n¿Qué tipo de madrugador sos?`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🏪 Dueño de tienda', callback_data: 'perfil_tienda' },
              { text: '💻 Freelancer', callback_data: 'perfil_freelance' },
            ],
            [
              { text: '🚀 Startup', callback_data: 'perfil_startup' },
              { text: '⚕️ Profesional', callback_data: 'perfil_profesional' },
            ],
          ],
        },
      }),
    })
  }

  // CALLBACKS (botones inline)
  if (body.callback_query) {
    const callback = body.callback_query.data
    const callbackChatId = body.callback_query.message.chat.id.toString()
    const messageId = body.callback_query.message.message_id

    if (callback.startsWith('perfil_')) {
      const perfil = callback.replace('perfil_', '')
      await supabase.from('suscriptores').update({ perfil }).eq('telegram_chat_id', callbackChatId)

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: callbackChatId,
          message_id: messageId,
          text: `✅ <b>Perfil: ${perfil.toUpperCase()}</b>\n\n¿Probás 3 días gratis?`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '🚀 Sí, iniciar trial', callback_data: 'iniciar_trial' }]],
          },
        }),
      })
    }

    if (callback === 'iniciar_trial') {
      const fechaFin = new Date()
      fechaFin.setDate(fechaFin.getDate() + 3)

      await supabase
        .from('suscriptores')
        .update({ estado: 'trial', trial_fin: fechaFin.toISOString() })
        .eq('telegram_chat_id', callbackChatId)

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: callbackChatId,
          message_id: messageId,
          text: `✅ <b>Trial 3 días activado</b>\n\nTu primera frase llega mañana 6AM.\n\n¿Pagás ahora? Escribí <b>PAGAR</b>`,
          parse_mode: 'HTML',
        }),
      })
    }
  }

  // COMANDO PAGAR
  if (message?.toUpperCase() === 'PAGAR') {
    const { data: user } = await supabase
      .from('suscriptores')
      .select('codigo_referido, perfil')
      .eq('telegram_chat_id', chatId)
      .single()

    const linkPago = `${process.env.NEXT_PUBLIC_URL}/pagar?chat_id=${chatId}&ref=${user?.codigo_referido}&perfil=${user?.perfil || 'tienda'}`

    await sendTelegramMessage(
      chatId,
      `💳 <b>Pagar suscripción</b>\n\n👉 <a href="${linkPago}">Click para pagar $19.900 COP/mes</a>\n\n🔒 Seguro vía Wompi`
    )
  }

  // COMANDO REFERIDOS
  if (message?.toUpperCase() === 'REFERIDOS') {
    const { data: user } = await supabase
      .from('suscriptores')
      .select('codigo_referido, amigos_invitados, meses_gratis_acumulados')
      .eq('telegram_chat_id', chatId)
      .single()

    if (user) {
      const linkReferido = `https://t.me/${process.env.NEXT_PUBLIC_BOT_NAME}?start=REF_${user.codigo_referido}`
      await sendTelegramMessage(
        chatId,
        `🎁 <b>Tus referidos</b>\n\n• Amigos: ${user.amigos_invitados}\n• Meses gratis: ${user.meses_gratis_acumulados}\n\n<b>Tu link:</b>\n<code>${linkReferido}</code>\n\n1 amigo pago = 1 mes gratis para ambos.`
      )
    }
  }

  // COMANDO MI CUENTA
  if (message?.toUpperCase() === 'MI CUENTA') {
    const { data: user } = await supabase
      .from('suscriptores')
      .select('estado, perfil, proximo_cobro, meses_gratis_acumulados, amigos_invitados, frases_enviadas, trial_fin')
      .eq('telegram_chat_id', chatId)
      .single()

    if (user) {
      const vence = user.estado === 'trial' ? user.trial_fin : user.proximo_cobro
      const dias = vence
        ? Math.ceil((new Date(vence).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0

      await sendTelegramMessage(
        chatId,
        `📊 <b>Tu cuenta</b>\n\nEstado: ${user.estado.toUpperCase()}\nPerfil: ${user.perfil}\nVence en: ${dias} días\nMeses gratis: ${user.meses_gratis_acumulados} ⭐\nAmigos: ${user.amigos_invitados}\nFrases: ${user.frases_enviadas}`
      )
    }
  }

  // COMANDO BAJA
  if (message?.toUpperCase() === 'BAJA') {
    await supabase.from('suscriptores').update({ estado: 'cancelado' }).eq('telegram_chat_id', chatId)
    await sendTelegramMessage(chatId, `❌ Suscripción cancelada. Podés reactivar con PAGAR cuando quieras.`)
  }

  return NextResponse.json({ ok: true })
}
