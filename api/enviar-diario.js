import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const frasesPorPerfil = {
  tienda: [
    '🏪 Hoy no es un día más, hoy es el día que un cliente fiel decide volver.',
    '☕ El local está frio a las 6am, pero tu actitud lo calienta todo.',
    '💪 Otro día de inventario, proveedores y cuentas. Y sos tan libre que elegís esto.',
    '🌅 La competencia duerme, vos ya estás acomodando la vitrina.',
  ],
  freelance: [
    '💻 No hay jefe que te controle, solo deadlines que te persiguen. Hoy los domás.',
    '⏰ Procrastinar es tentador, pero el café está caliente y el cliente espera.',
    '💼 Cobrarle al difícil es arte. Hoy practicás ese arte con elegancia.',
    '🎯 Tu valor no es el tiempo que sentás, es el problema que resolvés.',
  ],
  startup: [
    '🚀 Pivotar no es rendirse, es encontrar el ángulo correcto.',
    '💌 El inversor no te respondió. No importa, hay 20 más que mandar.',
    '📊 El burn rate te preocupa a las 3am. Hoy tomás decisiones para bajarlo.',
    '🎯 El producto perfecto no existe, pero el que vende sí. Shipeá hoy.',
  ],
  profesional: [
    '⚖️ Otro día salvando vidas. Tu expertise es el escudo de otros.',
    '🏆 La carrera te agota, pero tu reputación te sustenta. Cuidala hoy.',
    '📚 Estudiaste años para este momento. No es rutina, es maestría.',
    '🤝 Tu ética profesional es tu verdadero curriculum. Protegela.',
  ],
}

function obtenerFrase(perfil, dia, nombre) {
  const frases = frasesPorPerfil[perfil] || frasesPorPerfil.tienda
  const frase = frases[dia % frases.length]
  return nombre ? `${nombre}, ${frase.toLowerCase()}` : frase
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // ⚠️ Fix: en Vercel serverless req.headers es un objeto plano, no usa .get()
  const auth = req.headers['authorization']
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const hoy = new Date()
  const hoyStr = hoy.toISOString().split('T')[0]
  const diaDelMes = hoy.getDate()

  const { data: usuarios } = await supabase
    .from('suscriptores')
    .select('*')
    .or(`estado.eq.activo,and(estado.eq.trial,trial_fin.gte.${hoyStr})`)

  if (!usuarios?.length) return res.json({ mensaje: 'Nadie para enviar' })

  let enviados = 0

  for (const user of usuarios) {
    try {
      if (
        user.estado === 'activo' &&
        user.proximo_cobro &&
        new Date(user.proximo_cobro) <= hoy &&
        user.meses_gratis_acumulados > 0
      ) {
        const nuevaFecha = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        await supabase
          .from('suscriptores')
          .update({
            meses_gratis_acumulados: user.meses_gratis_acumulados - 1,
            proximo_cobro: nuevaFecha,
          })
          .eq('id', user.id)

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegram_chat_id,
            text: `🎁 Usaste 1 mes gratis. Quedan ${user.meses_gratis_acumulados - 1}.`,
          }),
        })
      }

      const frase = obtenerFrase(user.perfil || 'tienda', diaDelMes, user.nombre)

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_chat_id,
          text: `🌅 <b>${hoy.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</b>\n\n${frase}\n\n— Los que Madrugan`,
          parse_mode: 'HTML',
        }),
      })

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

  return res.json({ enviados, total: usuarios.length })
}
