import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAuth(req: Request) {
  return req.headers.get('Authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

export async function GET(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No auth' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const perfil = searchParams.get('perfil') || 'tienda'
  const { data } = await supabase.from('frases_banco').select('*').eq('perfil', perfil).order('creada_en')
  return NextResponse.json({ frases: data })
}

export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No auth' }, { status: 401 })
  const { perfil, texto } = await req.json()
  const { data } = await supabase.from('frases_banco').insert({ perfil, texto }).select().single()
  return NextResponse.json({ frase: data })
}

export async function PUT(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No auth' }, { status: 401 })
  const { id, texto, activa } = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (texto !== undefined) updates.texto = texto
  if (activa !== undefined) updates.activa = activa
  const { data } = await supabase.from('frases_banco').update(updates).eq('id', id).select().single()
  return NextResponse.json({ frase: data })
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No auth' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await supabase.from('frases_banco').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
