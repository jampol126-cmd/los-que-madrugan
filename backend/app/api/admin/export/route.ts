import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'No auth' }, { status: 401 })
  }

  const { data: users } = await supabase
    .from('suscriptores')
    .select('nombre, email, telefono, estado, perfil, creado_en, frases_enviadas, amigos_invitados')

  const headers = ['Nombre', 'Email', 'Telefono', 'Estado', 'Perfil', 'Fecha Registro', 'Frases', 'Referidos']
  const rows = users?.map(u => [
    u.nombre, u.email, u.telefono, u.estado, u.perfil, u.creado_en, u.frases_enviadas, u.amigos_invitados,
  ]) || []

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="madrugadores.csv"',
    },
  })
}
