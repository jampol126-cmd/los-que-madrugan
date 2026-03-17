const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.headers['authorization'] !== `Bearer ${process.env.ADMIN_SECRET}`) return res.status(401).json({ error: 'No auth' })

  const { data: users } = await supabase
    .from('suscriptores')
    .select('nombre, email, telefono, estado, perfil, creado_en, frases_enviadas, amigos_invitados')

  const headers = ['Nombre', 'Email', 'Telefono', 'Estado', 'Perfil', 'Fecha Registro', 'Frases', 'Referidos']
  const rows = (users ?? []).map(u => [u.nombre, u.email, u.telefono, u.estado, u.perfil, u.creado_en, u.frases_enviadas, u.amigos_invitados])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="madrugadores.csv"')
  return res.send(csv)
}
