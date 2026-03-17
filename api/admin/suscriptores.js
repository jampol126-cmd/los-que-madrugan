import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.headers['authorization'] !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'No auth' })
  }

  const { data, error } = await supabase
    .from('suscriptores')
    .select(
      'id, telegram_chat_id, nombre, email, telefono, perfil, estado, trial_fin, proximo_cobro, ultimo_pago, frases_enviadas, amigos_invitados, meses_gratis_acumulados, creado_en'
    )
    .order('creado_en', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ suscriptores: data })
}
