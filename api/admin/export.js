import { handleOptions, requireAdminAuth, supabase } from '../_lib/common.js';

function escapeCsv(value) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  if (!requireAdminAuth(req, res)) return;

  try {
    const { data, error } = await supabase
      .from('suscriptores')
      .select('nombre, email, telefono, estado, perfil, creado_en, frases_enviadas, amigos_invitados');

    if (error) throw error;

    const headers = ['Nombre', 'Email', 'Telefono', 'Estado', 'Perfil', 'Fecha Registro', 'Frases', 'Referidos'];
    const rows = (data || []).map((row) => [
      row.nombre,
      row.email,
      row.telefono,
      row.estado,
      row.perfil,
      row.creado_en,
      row.frases_enviadas,
      row.amigos_invitados,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="madrugadores.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error export:', error);
    return res.status(500).json({ error: error.message });
  }
}
