// Endpoint para limpiar usuarios inactivos (más de 6 meses sin actividad)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Solo POST con autorización
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const ahora = new Date();
    const hace6Meses = new Date(ahora);
    hace6Meses.setMonth(hace6Meses.getMonth() - 6);
    
    const hace6MesesStr = hace6Meses.toISOString();

    // Buscar usuarios inactivos (prospectos o cancelados/vencidos hace más de 6 meses)
    const { data: inactivos, error: selectError } = await supabase
      .from('suscriptores')
      .select('id, telegram_chat_id, nombre, estado, ultimo_envio, creado_en, estado_eliminacion')
      .or(`estado.eq.prospecto,and(estado.eq.cancelado,ultimo_envio.lt.${hace6MesesStr}),and(estado.eq.vencido,ultimo_envio.lt.${hace6MesesStr})`)
      .is('estado_eliminacion', null); // No eliminados anteriormente

    if (selectError) {
      console.error('Error consultando inactivos:', selectError);
      return res.status(500).json({ error: selectError.message });
    }

    const paraEliminar = inactivos || [];
    let eliminados = 0;
    let errores = [];

    for (const user of paraEliminar) {
      try {
        // En lugar de eliminar físicamente, marcamos como eliminado
        // y anonimizamos datos personales (RGPD/Ley de Protección de Datos)
        await supabase
          .from('suscriptores')
          .update({
            estado: 'eliminado',
            estado_eliminacion: 'auto_6meses',
            fecha_eliminacion: new Date().toISOString(),
            // Anonimizar datos personales
            nombre: 'Usuario Eliminado',
            email: null,
            telefono: null,
            telegram_chat_id: `deleted_${user.id}`,
            codigo_referido: null,
            referido_por: null,
            metadata: null
          })
          .eq('id', user.id);

        eliminados++;
      } catch (err) {
        errores.push({ user: user.id, error: err.message });
      }
    }

    // Log de la operación
    console.log(`Limpieza automática: ${eliminados} usuarios marcados como eliminados`);

    // Notificar al admin
    const ADMIN_CHAT_ID = '1758647248';
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: `🧹 <b>Limpieza automática completada</b>\n\n` +
              `📊 Usuarios procesados: ${paraEliminar.length}\n` +
              `✅ Eliminados (anonimizados): ${eliminados}\n` +
              `❌ Errores: ${errores.length}\n\n` +
              `Criterio: Prospectos/Cancelados/Vencidos sin actividad > 6 meses`,
        parse_mode: 'HTML'
      })
    });

    return res.json({
      success: true,
      fecha: ahora.toISOString(),
      criterio: '6_meses_inactividad',
      encontrados: paraEliminar.length,
      eliminados,
      errores: errores.length > 0 ? errores : undefined
    });

  } catch (error) {
    console.error('Error en limpieza:', error);
    return res.status(500).json({ error: error.message });
  }
}
