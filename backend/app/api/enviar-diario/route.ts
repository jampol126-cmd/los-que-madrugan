import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'
import { obtenerFrasePersonalizada } from '@/lib/frases'

export async function POST(req: Request) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const hoy = new Date()
  const hoyStr = hoy.toISOString().split('T')[0]
  const diaDelMes = hoy.getDate()

  const { data: usuarios } = await supabase
    .from('suscriptores')
    .select('*')
    .or(`estado.eq.activo,and(estado.eq.trial,trial_fin.gte.${hoyStr})`)

  if (!usuarios?.length) return NextResponse.json({ mensaje: 'Nadie para enviar' })

  let enviados = 0

  for (const user of usuarios) {
    try {
      // Aplicar mes gratis si toca cobrar y tiene meses acumulados
      if (
        user.estado === 'activo' &&
        user.proximo_cobro &&
        new Date(user.proximo_cobro) <= hoy &&
        user.meses_gratis_acumulados > 0
      ) {
        const nuevaFecha = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        await supabase
          .from('suscriptores')
          .update({ meses_gratis_acumulados: user.meses_gratis_acumulados - 1, proximo_cobro: nuevaFecha })
          .eq('id', user.id)

        await sendTelegramMessage(
          user.telegram_chat_id,
          `🎁 Usaste 1 mes gratis. Quedan ${user.meses_gratis_acumulados - 1}.`
        )
      }

      const frase = await obtenerFrasePersonalizada(user.perfil || 'tienda', diaDelMes, user.nombre)

      await sendTelegramMessage(
        user.telegram_chat_id,
        `🌅 <b>${hoy.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</b>\n\n${frase}\n\n— Los que Madrugan`
      )

      await supabase
        .from('suscriptores')
        .update({
          frases_enviadas: (user.frases_enviadas || 0) + 1,
          ultimo_envio: hoy.toISOString(),
        })
        .eq('id', user.id)

      enviados++
    } catch (e) {
      console.error(`Error con ${user.telegram_chat_id}:`, e)
    }
  }

  return NextResponse.json({ enviados, total: usuarios.length })
}
