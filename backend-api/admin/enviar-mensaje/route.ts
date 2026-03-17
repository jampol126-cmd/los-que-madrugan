// ⚠️ AGREGAR ESTE ARCHIVO A TU PROYECTO NEXT.JS
// Ruta: app/api/admin/enviar-mensaje/route.ts

import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

function checkAuth(req: Request) {
  return req.headers.get('Authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

// POST /api/admin/enviar-mensaje — envía un mensaje de Telegram desde el admin
export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const { chat_id, mensaje } = await req.json()
  if (!chat_id || !mensaje) return NextResponse.json({ error: 'Falta chat_id o mensaje' }, { status: 400 })

  const result = await sendTelegramMessage(chat_id, `📢 <b>Mensaje del equipo:</b>\n\n${mensaje}`)

  if (!result) return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
