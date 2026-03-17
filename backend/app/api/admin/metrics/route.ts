import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'No auth' }, { status: 401 })
  }

  const [{ count: total }, { count: activos }, { count: en_trial }, { data: porPerfil }] =
    await Promise.all([
      supabase.from('suscriptores').select('*', { count: 'exact', head: true }),
      supabase.from('suscriptores').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
      supabase.from('suscriptores').select('*', { count: 'exact', head: true }).eq('estado', 'trial'),
      supabase.from('suscriptores').select('perfil'),
    ])

  // Agrupar por perfil manualmente (Supabase JS no tiene .group())
  const counts: Record<string, number> = {}
  for (const row of porPerfil ?? []) {
    counts[row.perfil] = (counts[row.perfil] || 0) + 1
  }
  const por_perfil = Object.entries(counts).map(([perfil, count]) => ({ perfil, count }))

  return NextResponse.json({
    total_usuarios: total ?? 0,
    activos: activos ?? 0,
    en_trial: en_trial ?? 0,
    mrr_cop: (activos ?? 0) * 19900,
    por_perfil,
  })
}
