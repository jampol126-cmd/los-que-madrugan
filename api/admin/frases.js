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

  if (req.method === 'GET') {
    const perfil = req.query.perfil || 'tienda'
    const { data } = await supabase
      .from('frases_banco')
      .select('*')
      .eq('perfil', perfil)
      .order('creada_en')
    return res.json({ frases: data })
  }

  if (req.method === 'POST') {
    const { perfil, texto } = req.body
    const { data } = await supabase.from('frases_banco').insert({ perfil, texto }).select().single()
    return res.json({ frase: data })
  }

  if (req.method === 'PUT') {
    const { id, texto, activa } = req.body
    const updates = { updated_at: new Date().toISOString() }
    if (texto !== undefined) updates.texto = texto
    if (activa !== undefined) updates.activa = activa
    const { data } = await supabase.from('frases_banco').update(updates).eq('id', id).select().single()
    return res.json({ frase: data })
  }

  if (req.method === 'DELETE') {
    const id = req.query.id
    await supabase.from('frases_banco').delete().eq('id', id)
    return res.json({ ok: true })
  }

  return res.status(405).end()
}
