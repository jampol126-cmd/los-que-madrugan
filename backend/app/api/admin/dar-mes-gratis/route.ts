import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

function checkAuth(req: Request) {
  return req.headers.get('Authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No auth' }, { status: 401 })
  const { chat_id } = await req.json()
  if (!chat_id) return NextResponse.json({ error: 'Falta chat_id' }, { status: 400 })

  const { data: user, error } = await supabase
    .from('suscriptores')
    .select('meses_gratis_acumulados')
    .eq('telegram_chat_id', chat_id)
    .single()

  if (error || !user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  await supabase
    .from('suscriptores')
    .update({ meses_gratis_acumulados: user.meses_gratis_acumulados + 1 })
    .eq('telegram_chat_id', chat_id)

  await sendTelegramMessage(
    chat_id,
    `🎁 El equipo de Los que Madrugan te regaló 1 mes gratis. Tenés ${user.meses_gratis_acumulados + 1} mes(es) acumulados.`
  )
  return NextResponse.json({ ok: true })
}
