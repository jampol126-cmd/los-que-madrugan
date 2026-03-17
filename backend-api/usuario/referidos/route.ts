// ⚠️ AGREGAR ESTE ARCHIVO A TU PROYECTO NEXT.JS
// Ruta: app/api/usuario/referidos/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/usuario/referidos?chat_id=XXX — datos de referidos del usuario
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const chatId = searchParams.get('chat_id')

  if (!chatId) return NextResponse.json({ error: 'Falta chat_id' }, { status: 400 })

  // Buscar al usuario
  const { data: user, error: userError } = await supabase
    .from('suscriptores')
    .select('id, codigo_referido, meses_gratis_acumulados, amigos_invitados')
    .eq('telegram_chat_id', chatId)
    .single()

  if (userError || !user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  // Buscar sus referidos en el log
  const { data: logs } = await supabase
    .from('referidos_log')
    .select('id, estado, fecha_registro, invitado_id')
    .eq('invitador_id', user.id)
    .order('fecha_registro', { ascending: false })

  // Obtener los nombres de los invitados
  const invitadoIds = (logs ?? []).map(l => l.invitado_id)
  let invitadosData: Array<{ id: string; nombre: string | null }> = []

  if (invitadoIds.length > 0) {
    const { data } = await supabase
      .from('suscriptores')
      .select('id, nombre')
      .in('id', invitadoIds)
    invitadosData = data ?? []
  }

  const nombresMap = Object.fromEntries(invitadosData.map(i => [i.id, i.nombre]))

  const referidos = (logs ?? []).map(log => ({
    id: log.id,
    nombre: nombresMap[log.invitado_id] ?? null,
    estado: log.estado,
    fecha_registro: log.fecha_registro,
  }))

  return NextResponse.json({
    codigo_referido: user.codigo_referido,
    meses_gratis_acumulados: user.meses_gratis_acumulados,
    amigos_invitados: user.amigos_invitados,
    referidos,
  })
}
