import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const chatId = searchParams.get('chat_id')
  if (!chatId) return NextResponse.json({ error: 'Falta chat_id' }, { status: 400 })

  const { data: user, error } = await supabase
    .from('suscriptores')
    .select('id, codigo_referido, meses_gratis_acumulados, amigos_invitados')
    .eq('telegram_chat_id', chatId)
    .single()

  if (error || !user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const { data: logs } = await supabase
    .from('referidos_log')
    .select('id, estado, fecha_registro, invitado_id')
    .eq('invitador_id', user.id)
    .order('fecha_registro', { ascending: false })

  const invitadoIds = (logs ?? []).map(l => l.invitado_id)
  let nombres: Record<string, string | null> = {}

  if (invitadoIds.length > 0) {
    const { data } = await supabase.from('suscriptores').select('id, nombre').in('id', invitadoIds)
    nombres = Object.fromEntries((data ?? []).map(i => [i.id, i.nombre]))
  }

  return NextResponse.json({
    codigo_referido: user.codigo_referido,
    meses_gratis_acumulados: user.meses_gratis_acumulados,
    amigos_invitados: user.amigos_invitados,
    referidos: (logs ?? []).map(l => ({
      id: l.id,
      nombre: nombres[l.invitado_id] ?? null,
      estado: l.estado,
      fecha_registro: l.fecha_registro,
    })),
  })
}
