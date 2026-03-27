import { handleOptions, requireAdminAuth, supabase } from '../_lib/common.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireAdminAuth(req, res)) return;

  try {
    if (req.method === 'GET') {
      const { perfil = 'tienda' } = req.query;
      const { data, error } = await supabase
        .from('frases_banco')
        .select('*')
        .eq('perfil', perfil)
        .order('creada_en');

      if (error) throw error;
      return res.status(200).json({ frases: data || [] });
    }

    if (req.method === 'POST') {
      const { perfil, texto } = req.body;
      const { data, error } = await supabase
        .from('frases_banco')
        .insert({ perfil, texto })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ frase: data });
    }

    if (req.method === 'PUT') {
      const { id, texto, activa } = req.body;
      const updates = {};
      if (texto !== undefined) updates.texto = texto;
      if (activa !== undefined) updates.activa = activa;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('frases_banco')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ frase: data });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const { error } = await supabase.from('frases_banco').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error frases:', error);
    return res.status(500).json({ error: error.message });
  }
}
