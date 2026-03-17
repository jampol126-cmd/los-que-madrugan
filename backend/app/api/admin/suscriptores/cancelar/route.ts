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

  const { error } = await supabase
    .from('suscriptores')
    .update({ estado: 'cancelado' })
    .eq('telegram_chat_id', chat_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sendTelegramMessage(chat_id, '❌ Tu suscripción fue cancelada por el administrador. Escribí PAGAR para reactivar.')
  return NextResponse.json({ ok: true })
}
