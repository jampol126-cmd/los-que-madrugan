const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.headers['authorization'] !== `Bearer ${process.env.ADMIN_SECRET}`) return res.status(401).json({ error: 'No auth' })

  const [{ count: total }, { count: activos }, { count: en_trial }, { data: porPerfil }] = await Promise.all([
    supabase.from('suscriptores').select('*', { count: 'exact', head: true }),
    supabase.from('suscriptores').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
    supabase.from('suscriptores').select('*', { count: 'exact', head: true }).eq('estado', 'trial'),
    supabase.from('suscriptores').select('perfil'),
  ])

  const counts = {}
  for (const row of porPerfil ?? []) counts[row.perfil] = (counts[row.perfil] || 0) + 1
  const por_perfil = Object.entries(counts).map(([perfil, count]) => ({ perfil, count }))

  return res.json({ total_usuarios: total ?? 0, activos: activos ?? 0, en_trial: en_trial ?? 0, mrr_cop: (activos ?? 0) * 19900, por_perfil })
}
