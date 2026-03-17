// ⚠️ AGREGAR ESTE ARCHIVO A TU PROYECTO NEXT.JS
// Ruta: app/api/admin/suscriptores/route.ts
//
// También agrega el sub-endpoint de cancelar:
// app/api/admin/suscriptores/cancelar/route.ts  ←  ver abajo

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAuth(req: Request) {
  return req.headers.get('Authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

// GET /api/admin/suscriptores — lista todos los suscriptores
export async function GET(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const { data, error } = await supabase
    .from('suscriptores')
    .select(
      'id, telegram_chat_id, nombre, email, telefono, perfil, estado, trial_fin, proximo_cobro, ultimo_pago, frases_enviadas, amigos_invitados, meses_gratis_acumulados, creado_en'
    )
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ suscriptores: data })
}
