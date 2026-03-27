import { handleOptions, requireAdminAuth, supabase } from '../_lib/common.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  if (!requireAdminAuth(req, res)) return;

  try {
    const [{ count: total }, { count: activos }, { count: enTrial }, { data: porPerfil }] =
      await Promise.all([
        supabase.from('suscriptores').select('*', { count: 'exact', head: true }),
        supabase.from('suscriptores').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
        supabase.from('suscriptores').select('*', { count: 'exact', head: true }).eq('estado', 'trial'),
        supabase.from('suscriptores').select('perfil'),
      ]);

    const counts = {};
    for (const row of porPerfil || []) {
      counts[row.perfil] = (counts[row.perfil] || 0) + 1;
    }

    return res.status(200).json({
      total_usuarios: total || 0,
      activos: activos || 0,
      en_trial: enTrial || 0,
      mrr_cop: (activos || 0) * 9900,
      por_perfil: Object.entries(counts).map(([perfil, count]) => ({ perfil, count })),
    });
  } catch (error) {
    console.error('Error metrics:', error);
    return res.status(500).json({ error: error.message });
  }
}
